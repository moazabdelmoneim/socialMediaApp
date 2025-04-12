
import userModel from "../../DB/models/user.model.js";
import * as dbService from '../../DB/db.service.js'
import { customAlphabet } from "nanoid";
import { EventEmitter } from "node:events";
import { generateHash } from "../security/hashing.js";
import { sendEmail } from "../mail/sendEmail.js";
import { verifyEmail } from "../mail/template/emailTemaplate.js";



export const emailEvent = new EventEmitter({});
export const subjectTypes = {
    confirmEmail: "confirmEmail",
    forgetPassword: "forgetPassword",
    updateEmail: "updateEmail"
}


const sendCode = async ({ data, subject = 'confirmEmail' } = {}) => {
    const { id, email } = data;
    const otp = customAlphabet("0123456789", 4)();
    const hashOtp = await generateHash({ plainText: otp })
    let updatedData = {}
    switch (subject) {
        case subjectTypes.confirmEmail:
            updatedData = { otp: hashOtp }
            break;

        case subjectTypes.forgetPassword:
            updatedData = { forgetPasswordOtp: hashOtp }
            break;

        case subjectTypes.updateEmail:
            updatedData = { updateEmailOtp: hashOtp }
            break;

        default:
            break;
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: id },
        data: updatedData
    })
    const html = verifyEmail({ code: otp })
    await sendEmail({ to: email, subject, html })
}
emailEvent.on("sendConfirmEmail", async (data) => {

    await sendCode({ data, subject: 'confirmEmail' })
})
emailEvent.on("sendUpdateEmail", async (data) => {

    await sendCode({ data, subject: 'updateEmail' })
})
emailEvent.on("sendForgetPassword", async (data) => {

    await sendCode({ data, subject: "forgetPassword" })
})