import joi from 'joi'
import { generalFields } from '../../middlewares/validation.middleware.js'

export const signup =joi.object().keys({
    userName: generalFields.userName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref('password')).required(),
    phone: generalFields.phone,
}).required()

export const login=joi.object().keys({
    email:generalFields.email.required(),
    password:generalFields.password.required()
}).required()
export const forgetPassword=joi.object().keys({
    email:generalFields.email.required()
}).required()
export const resetPassword= joi.object().keys({
    email:generalFields.email.required(),
    code:joi.string().pattern(new RegExp(/^\d{4}$/)).required(),
    password:generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref('password')).required()
}).required()
export const confirmEmail= joi.object().keys({
    email:generalFields.email.required(),
    code:joi.string().pattern(new RegExp(/^\d{4}$/)).required()
}).required()

