import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js"

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError("Unauthorized request", 401)
        }

        const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(data?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError("Invalid Access Token!", 401)
        }

        req.user = user

        next()
    } catch (error) {
        return res.status(400).json(new ApiError(error))
    }
})

export default verifyJWT