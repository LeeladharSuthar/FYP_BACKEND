import { DB_CONNECT } from './db/connectDb.js'
import { app } from './app.js'
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 3000


DB_CONNECT()
    .then((res) => {
        console.log(`Connection Successful: ${res.connections[0]._readyState == 1}`)

        app.on("error", (error) => {
            console.log("EXPRESS ERROR: ", error)
        })

        app.listen(port, () => {
            console.log(`Server Started listening at port : ${port}`)
        })
    })
    .catch((error) => {
        console.log("DB CONNECTION FAILED: ", error);
    })