import * as dbService from "../../../DB/db.service.js"
import { asyncHandler } from "../../../utils/response/error.js";
import userModel, { roleTypes } from "../../../DB/models/user.model.js";
import { compareHash, generateHash } from "../../../utils/security/hashing.js";
import { successRes } from "../../../utils/response/successRes.js";
import { decodeToken, generateToken, tokenTypes } from "../../../utils/security/token.js";
import { emailEvent } from "../../../utils/events/email.event.js";



export const login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body;

    const user = await dbService.findOne({
        model: userModel,
        filter: { email } 
    })

    if (!user) {
        return next(new Error('user is not found', { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error('please verify your account', { cause: 400 }))
    }
    if (!await compareHash({ plainText: password, hashed: user.password })) {
        return next(new Error('in_valid email or password', { cause: 400 }))
    }

    const accessToken =  generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.User ? process.env.USER_TOKEN_SIGNATURE : process.env.SYSTEM_TOKEN_SIGNATURE })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.User ? process.env.USER_REFRESH_TOKEN_SIGNATURE : process.env.SYSTEM_REFRESH_TOKEN_SIGNATURE })


    return successRes({ res, message: 'loggedin successfully', data: {token:{accessToken, refreshToken}  }, status: 201 })
})


export const refreshToken=asyncHandler(async(req,res,next)=>{
    
    const user= await decodeToken({authorization:req.headers.authorization ,tokenType :tokenTypes.refresh,next })
    const accessTokn = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.User ? process.env.USER_TOKEN_SIGNATURE : process.env.SYSTEM_TOKEN_SIGNATURE })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.User ? process.env.USER_REFRESH_TOKEN_SIGNATURE : process.env.SYSTEM_REFRESH_TOKEN_SIGNATURE })


    return successRes({ res, message: 'done', data: { accessTokn, refreshToken }, status: 201 })
})


export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await dbService.findOne({
        model: userModel,
        filter: { email, isDeleted: false }
    })
    if (!user) {
        return next(new Error('in-valid account', { cause: 404 }))
    }
    if (!user.confirmEmail) {
        return next(new Error('please verify your account', { cause: 409 }))
    }
    emailEvent.emit("sendForgetPassword", {id:user._id, email: email })
    return successRes({ res })
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, password } = req.body
    
    const user = await dbService.findOne({
        model: userModel,
        filter: { email, isDeleted: false }
    })
    if (!user) {
        return next(new Error('in-valid account', { cause: 404 }))
    }
    if (!await compareHash({ plainText: code, hashed: user.forgetPasswordOtp })) {
        return next(new Error('invalid OTP', { cause: 400 }))
    }
    
    const hashPassword = await generateHash({ plainText: password, salt: 10 })
    await dbService.updateOne({
        model: userModel,
        filter: { email },
        data: {
            password: hashPassword,
            confirmEmail: true,
            changeCredentialTime: Date.now(),
            $unset: { forgetPasswordOtp: 0, otp: 0 }
        }
    })
    return successRes({ res })
})

