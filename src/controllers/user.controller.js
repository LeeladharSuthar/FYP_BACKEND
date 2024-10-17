import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { deleteFromCloudnary, uploadOnCloudnary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import fs from "fs"
import { MyCache } from "../app.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        const res = await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    const localAvatarPath = req.file?.path || "";

    if (!localAvatarPath) {
        throw new ApiError("Avatar file is required")
    }

    if ([email, name, password].some((field) => !field || field?.trim() === "")) {
        fs.unlink(localAvatarPath, (err) => {
            if (err) {
                console.log("Error while deleting file")
            }
        })
        throw new ApiError("All field are required")
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        fs.unlink(localAvatarPath, (err) => {
            if (err) {
                console.log("Error while deleting file")
            }
        })
        throw new ApiError("Email already exist")
    }


    const avatar = await uploadOnCloudnary(localAvatarPath)

    if (!avatar) {
        throw new ApiError("Cloudnary Error", 400)
    }

    const user = await User.create({
        name,
        avatar: avatar.url,
        password,
        email,
    })

    const createdUser = await User.findById(user._id)

    if (!createdUser) {
        throw new ApiError("Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, true, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new ApiError("Email is required", 400)
    }
    if (!password) {
        throw new ApiError("password not provided", 400)
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError("user does not exist", 404)
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError("invalid password provided", 401)
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const data = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: data
        }, true, "User Logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } })
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged-out successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, true, "Current user fetched successfully"))
})

const updateUser = asyncHandler(async (req, res) => {
    const { email, name } = req.body

    return res.status(200).json(new ApiResponse(200, result, "Success"))
})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError("Provide both old and new Passwords")
    }

    const user = await User.findById(req.user._id)

    const isCorrectOldPassword = await user.isPasswordCorrect(oldPassword)

    if (!isCorrectOldPassword) {
        throw new ApiError("Incorrect Old Password")
    }

    user.password = newPassword
    await user.save()
    return res.status(200).json(new ApiResponse(200, {}, true, "password updated successfully"))
})

const resetPassword = asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body
    const email = req.user.email

    const sentOtp = MyCache.get(email)
    if (sentOtp != otp) {
        throw new ApiError("Incorrect Otp")
    }

    MyCache.del(email)

    const user = await User.findById(req.user._id)
    user.password = newPassword
    await user.save()

    return res.status(200).json(new ApiResponse(200, {}, true, "Reset Successful"))

})

const deleteProfile = asyncHandler(async (req, res) => {
    await User.deleteOne({ email: req.user.email })
    return res.status(200).json(new ApiResponse(200, {}, true, "User Deleted Successfully"))
})

export { registerUser, loginUser, logoutUser, getCurrentUser, updatePassword, deleteProfile, resetPassword }