import joi from 'joi'
import { generalFields } from '../../middlewares/validation.middleware.js'




export const shareProfile=joi.object().keys({
    profileId:generalFields.id.required()
}).required()

export const updateProfileValidation=joi.object().keys({
    userName:generalFields.userName,
    phone:generalFields.phone,
    DOB:joi.date().less('now')
}).required()

export const passwordValidation=joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref('oldPassword')).required(),
    confirmationPassword: generalFields.password.valid(joi.ref('password')).required()

}).required()

export const updateEmail= joi.object().keys({
    email:generalFields.email.required()
    }).required()
export const replaceEmail= joi.object().keys({
    email:generalFields.email.required(),
    oldEmailCode:generalFields.otp.required(),
    code:generalFields.otp.required()
    }).required()


    export const userProfileGraph=joi.object().keys({
        authorization:joi.string().required()
        
        }).required()
        
        

export const friendRequest= joi.object().keys({
    friendId:generalFields.id.required()
    
    }).required()
    
    
    export const acceptFriendRequest= joi.object().keys({
    friendRequestId:generalFields.id.required()
        
        }).required()
        