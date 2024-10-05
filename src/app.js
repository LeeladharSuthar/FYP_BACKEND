import express from "express"
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

// Importing Routes
import userRoutes from "./routes/user.route.js"

// Routes declarations
app.use("/api/v1/user", userRoutes)

export { app }  