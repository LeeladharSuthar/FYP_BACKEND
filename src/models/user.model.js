import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true, 
    },
    avatar: {
        type: String
    },
    password: {
        typr: String
    },
    refreshToken: {
        type: String
    }
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}


UserSchema.methods.generateAccessToken = async function () {
    return await jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRYn // 1d
        }
    )
}

UserSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // 10d
        }
    )
}

export const User = mongoose.model("User", UserSchema)