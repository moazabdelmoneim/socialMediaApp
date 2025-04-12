import userModel from "../../DB/models/user.model.js";
import { verifyToken, tokenTypes } from "../../utils/security/token.js";
import * as DbServices from "../../DB/db.service.js";
import mongoose from "mongoose";

export const authentication = async ({
    authorization,
    tokenType = tokenTypes.access,
    accessRoles = [],
    checkAuthorization = false
} = {}) => {
    if (!authorization) {
        throw new Error("Missing authorization header");
    }

    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token) {
        throw new Error("Missing token component");
    }

    let accessSignature, refreshSignature;
    switch (bearer) {
        case "system":
            accessSignature = process.env.SYSTEM_TOKEN_SIGNATURE;
            refreshSignature = process.env.SYSTEM_REFRESH_TOKEN_SIGNATURE;
            break;
        case "Bearer":
            accessSignature = process.env.USER_TOKEN_SIGNATURE;
            refreshSignature = process.env.USER_REFRESH_TOKEN_SIGNATURE;
            break;
        default:
            throw new Error("Invalid token type");
    }

    if (!accessSignature || !refreshSignature) {
        throw new Error("Missing token signature configuration");
    }

    const decoded = verifyToken({
        token,
        signature: tokenType === tokenTypes.access ? accessSignature : refreshSignature
    });

    if (!decoded?.id) {
        throw new Error("Invalid decoded token");
    }


    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: decoded.id }
    });
    
    if (!user) {
        throw new Error("User not found");
    }

    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        throw new Error("Invalid credentials");
    }

    if (checkAuthorization && !accessRoles.includes(user.role)) {
        throw new Error("You are not authorized");
    }

    return user;
};
