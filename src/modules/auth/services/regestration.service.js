import userModel from "../../../DB/models/user.model.js";
import * as dbService from "../../../DB/db.service.js"
import { asyncHandler } from "../../../utils/response/error.js";
import { generateEncryption } from "../../../utils/security/encryption.js";
import { generateHash, compareHash } from "../../../utils/security/hashing.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { successRes } from "../../../utils/response/successRes.js";




export const signup = asyncHandler(async (req, res, next) => {

    const { userName, email, password, phone, role } = req.body;



    if (await dbService.findOne({
        model: userModel,
        filter: { email }
    })) {
        return next(new Error('email already exist', { cause: 409 }))
    }
    const encryptedPhone = generateEncryption({ plainText: phone, signature: process.env.ENCRYPTION_SIGNATURE })
    const hashPassword =await generateHash({ plainText: password, salt: 10 })
    const user = await dbService.create({
        model: userModel,
        data: { userName, email, password: hashPassword, phone: encryptedPhone, role ,$unset: { forgetPasswordOtp: 0, otp: 0 } }
    })

    emailEvent.emit('sendConfirmEmail', {id:user._id, email })
    return successRes({ res, message: 'check the OTP in your mail', data: { user }, status: 201 })

})

export const verifyOtp = asyncHandler(async (req, res, next) => {

    const { email, code } = req.body
    const user = await dbService.findOne({
        model: userModel,
        filter: { email }
    })
    if (!user) {
        return next(new Error('in_valid account', { cause: 404 }))
    }
    if (user.confirmEmail) {
        return next(new Error('already verified', { cause: 409 }))
    }
    if (!compareHash({ plainText: code, hashed: user.otp })) {
        return next(new Error('in_valid code', { cause: 400 }))
    }
    const userResult = await userModel.findOneAndUpdate({ email }, { confirmEmail: true, $unset: { confirmEmailOtp: 0 } }, { new: true })
    return successRes({ res, message: 'done', data: {  } })


})