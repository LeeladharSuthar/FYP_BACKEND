import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { deleteFromCloudnary, uploadOnCloudnary } from "../utils/cloudnary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import fs from "fs"

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

// const refreshAccessToken = asyncHandler(async (req, res) => {
//     try {
//         const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
//         if (!incomingRefreshToken) {
//             throw new ApiError(401, "unauthorized request")
//         }

//         const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
//         // console.log(decodedToken)
//         // { _id: '664060015d3954d757acb244', iat: 1715628735, exp: 1716492735 }
//         const user = await User.findById(decodedToken._id).select("-password")
//         // console.log(user)
//         if (!user) {
//             throw new ApiError(401, "Invalid refresh token!")
//         }
//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(401, "Invalid refresh token!")
//         }
//         const options = {
//             httpOnly: true,
//             secure: true
//         }
//         const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", refreshToken, options)
//             .json(new ApiResponse(200, {
//                 accessToken,
//                 refreshToken
//             }, "Access token refreshed"))
//     } catch (error) {
//         throw new ApiError(401, error.message || "Error while generating access token")
//     }
// })

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     // get old password and new password
//     const { currentPassword, newPassword, confirmNewPassword } = req.body

//     // verify new password and confirm password
//     if (newPassword !== confirmNewPassword) {
//         throw new ApiError(400, "New Password and confirm Password does't match")
//     }

//     // get data from db and verify old password
//     const user = await User.findById(req.user?._id)
//     const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)
//     if (!isPasswordCorrect) {
//         throw new ApiError(400, "Invalid old password")
//     }

//     // set the new passowrd
//     user.password = newPassword
//     await user.save({ validateBeforeSave: false })

//     // return confirm message
//     return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
// })

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, true, "Current user fetched successfully"))
})

const updateUser = asyncHandler(async (req, res) => {
    const { email, name } = req.body

    const user = await User.findById(req.user?._id)
    if (email === user.email && fullname === user.fullname) {
        throw new ApiError(400, "No changes provided")
    }

    if (email)
        user.email = email
    if (fullname)
        user.fullname = fullname
    const status = await user.save({ validateBeforeSave: false })

    const result = await User.findById(status._id).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, result, "Success"))
})

// const updateAvatar = asyncHandler(async (req, res) => {
//     const avatarLocalPath = req.file?.path
//     // console.log(req.file)
//     // {
//     //     fieldname: 'avatar',
//     //     originalname: 'img.jpg',
//     //     encoding: '7bit',
//     //     mimetype: 'image/jpeg',
//     //     destination: './public/temp',
//     //     filename: 'avatar1715780458842.jpg',
//     //     path: 'public\\temp\\avatar1715780458842.jpg',
//     //     size: 308300
//     // }


//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file missing")
//     }
//     const avatar = await uploadOnCloudnary(avatarLocalPath)
//     if (!avatar) {
//         throw new ApiError(400, "Cloudnary Error")
//     }

//     const user = await User.findById(req.user._id)
//     const oldUrl = user.avatar

//     user.avatar = avatar.url

//     await user.save({ validateBeforeSave: false })

//     const updatedUser = await User.findById(req.user._id).select("-password -refreshToken")

//     await deleteFromCloudnary(oldUrl)

//     return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar updated successful"))
// })

// export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUser, updateAvatar, updateCoverImage, getUserChannelProfile, watchHistory }

export { registerUser, loginUser, logoutUser, getCurrentUser }