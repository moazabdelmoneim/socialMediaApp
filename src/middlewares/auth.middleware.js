import { asyncHandler } from '../utils/response/error.js'
import { decodeToken } from '../utils/security/token.js'


export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        req.user = await decodeToken({ authorization: req.headers.authorization, next });
        return next();
    });
};



export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        const userRole = req.user?.role;

        if (!accessRoles.includes(userRole)) {
            return next(new Error(`Unauthorized: Access requires one of [${accessRoles.join(', ')}]`, { cause: 403 }));
        }
        next();
    });
};