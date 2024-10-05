import express from "express"

import NodeCache from "node-cache"
export const myCache = new NodeCache()

import dotenv from "dotenv"
dotenv.config({
    path: "./.env"
})

import { connectDB } from "./db/connectDb.js"

const app = express()
const port = process.env.PORT || 8080
const stripeKey = process.env.STRIPE_KEY || ""

import cors from "cors"
app.use(cors())

import Stripe from "stripe"
export const stripe = new Stripe(stripeKey)

app.use(express.json())

// Logs the requests made to the server in terminal
import morgan from "morgan"
app.use(morgan("dev"))

app.use("/uploads", express.static("uploads"))





// Importing Routes
import userRoutes from "./routes/user.route.js"

// Routes declarations
app.use("/api/v1/user", userRoutes)

app.get("/", (req, res) => {
    res.send("hello")
})

app.listen(port, () => {
    connectDB();
    console.log(`Server is listening at ${port}`)
})