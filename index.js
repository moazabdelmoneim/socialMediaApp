import express from'express'
import path from 'node:path'
import * as dotenv from'dotenv'
import bootstrap from './src/app.controller.js'
import { runIo } from './src/modules/socket/socket.controller.js'

dotenv.config({path:path.resolve("./src/config/.env.dev")})
const app = express()
bootstrap(app,express)
const PORT=process.env.PORT
const httpServer=app.listen(PORT,()=>{
    console.log(`app is running on port ${PORT} ✔️✔️`)
})

runIo(httpServer)