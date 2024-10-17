import express from "express"
import cookieParser from 'cookie-parser'
import cors from 'cors'
import NodeCache from "node-cache"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

// Importing Routes
import userRoutes from "./routes/user.routes.js"
import otpRoutes from "./routes/otp.route.js"

// Routes declarations
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/otp", otpRoutes)

app.get("/", (req, res) => {
    res.send("hello WOrld")
})

const MyCache = new NodeCache({stdTTL: 300})

export { app, MyCache }