import jwt from 'jsonwebtoken'
import userModel from '../../DB/models/user.model.js'
import * as dbService from '../../DB/db.service.js'

export const tokenTypes = {
    access: 'access',
    refresh: 'refresh'
}
export const userRoles = {
    user: 'user',
    admin: 'admin'
}

export const generateToken = ({ payload = "", signature = process.env.USER_TOKEN_SIGNATURE, options = {} } = {}) => {
    const token = jwt.sign(payload, signature, options)
    return token
}
export const verifyToken = ({ token = "", signature = process.env.USER_TOKEN_SIGNATURE } = {}) => {
    try {
        const decoded = jwt.verify(token, signature); 
        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired token"); 
    }
};

export const decodeToken = async ({ authorization = "", tokenType = tokenTypes.access,next } = {}) => {
    if (!authorization) {
        return next(new Error('Missing token', { cause: 401 }))
    }
    
    const [bearer, token] = authorization.split(' ');
    if (!bearer || !token) {
        return next(new Error('Invalid token format', { cause: 400 }))
    }

    let accessSignature = "";
    let refreshSignature = "";
    switch (bearer.toLowerCase()) {
        case 'admin':
            accessSignature = process.env.SYSTEM_TOKEN_SIGNATURE;
            refreshSignature = process.env.SYSTEM_REFRESH_TOKEN_SIGNATURE;
            break;
        case 'bearer':
            accessSignature = process.env.USER_TOKEN_SIGNATURE;
            refreshSignature = process.env.USER_REFRESH_TOKEN_SIGNATURE;
            break;
        default:
            return next(new Error('Invalid bearer type. Use "Bearer" or "Admin"', { cause: 401 }))
    }

    const decoded = verifyToken({ token, signature: tokenType === tokenTypes.access ? accessSignature : refreshSignature });
    
    if (!decoded?.id) {
    return next(new Error('Invalid token payload', { cause: 401 }))
    }

    const user = await dbService.findOne({
        model:userModel,
        filter:{_id:decoded.id},
        select:"-password"
    })
    
    if (!user) {
    return next(new Error('Invalid user', { cause: 404 })) 
    }

    if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
        return next(new Error('Invalid credentials', { cause: 403 }))
    }
    return user; 
    
}
