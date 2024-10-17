import { Router } from "express"
import { generateOTP } from "../controllers/otp.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/generateOtp").post(verifyJWT, generateOTP)

export default router