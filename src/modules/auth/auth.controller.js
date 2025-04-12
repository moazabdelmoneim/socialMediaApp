
import * as regService from "./services/regestration.service.js";
import * as loginService from "./services/login.service.js";
import { Router } from "express";
import { validation } from "../../middlewares/validation.middleware.js";
import { confirmEmail, forgetPassword, login, resetPassword, signup } from "./auth.validation.js";

const router=Router()
router.post("/signup",validation(signup),regService.signup)
router.patch("/confirm-email-OTP",validation(confirmEmail), regService.verifyOtp)
router.post('/login',validation(login),loginService.login)
router.patch("/forget-password", validation(forgetPassword),loginService.forgetPassword)
router.patch("/reset-password", validation(resetPassword),loginService.resetPassword)
router.post('/refresh-token',loginService.refreshToken)

export default router