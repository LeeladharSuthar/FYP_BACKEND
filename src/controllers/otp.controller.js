import { asyncHandler } from "../utils/asyncHandler.js"
import { MyCache } from "../app.js"
import { sendOtp } from "../utils/sendEmail.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"

const generateOTP = asyncHandler(async (req, res) => {
    const  email  = req.user.email

    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10)
    }

    MyCache.set(email, otp)

    const status = await sendOtp(process.env.EMAIL, email, "OTP to reset Password", `Otp is ${otp}. (expires in 5 mins)`)

    if (status) {
        return res.status(200).json(new ApiResponse(200, {}, true, "otp sent successfully"))
    } else {
        throw new ApiError("Error while sending otp")
    }
})

export { generateOTP }