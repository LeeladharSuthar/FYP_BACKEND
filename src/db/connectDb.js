import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DB_CONNECT = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
        return connectionInstance
    } catch (error) {
        console.log("MONGODB CONNECTION ERROR", error)
        process.exit(1)
    }
}

export { DB_CONNECT }