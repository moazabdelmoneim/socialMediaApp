import joi from 'joi'
import { Types } from 'mongoose'


const checkObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("in-valid objectId")
}
const fileObject = {
    fieldname: joi.string().valid("attachments"),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.number()
}

export const generalFields = {
    userName: joi.string().alphanum().case('upper').min(2).max(20).messages({
        'string.min': 'the minimum length of the name is 2',
        'string.empty': 'the name field cannot be empty ',
        'any.required': 'the name field is required'
    }),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#&<>@\"~;$^%{}?])(?=.*[a-zA-z]).{8,}$/)),
    confirmationPassword: joi.string().valid(joi.ref("password")),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    id: joi.string().custom(checkObjectId),
    otp: joi.string()
        .length(4)
        .pattern(/^\d+$/) 
        .required()
        .messages({
            "string.length": "OTP must be exactly 4 digits.",
            "string.pattern.base": "OTP must contain only numbers.",
            "any.required": "OTP is required.",
        }),
    fileObject,
    file: joi.object(fileObject)
}
export const validation = (schema) => {
    return (req, res, next) => {

        const inputData = { ...req.body, ...req.params }
        if (req.file || req.files?.length) {
            inputData.file = { ...req.file, ...req.files }
        }
        console.log(inputData);

        const validationResult = schema.validate(inputData, { abortEarly: false })

        if (validationResult.error) {
            return res.status(400).json({ message: 'validation error', validationResult: validationResult.error.details })
        }

        return next();
    };
};
