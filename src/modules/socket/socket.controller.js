import { Server } from 'socket.io'
import { logOutSocketId, registerSocket } from './services/auth.socket.services.js'
import { sendMessage } from './services/sendMessage.services.js'
let io = undefined
export const runIo = (httpServer) => {
    io = new Server(httpServer, { cors: "*" })

    io.on("connection", async (socket) => {
        console.log(socket.id)
        console.log(socket.handshake.auth.authorization)
        await registerSocket(socket)
        await logOutSocketId(socket)
        await sendMessage(socket)
        // await sendMessgeInRoomChat(socket)
    })
}

export const getIo = () => {
    return io
}