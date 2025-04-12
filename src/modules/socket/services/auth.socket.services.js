import {socketConnection} from "../../../DB/models/user.model.js"
import { authentication } from "../../../middlewares/socketIo/auth.socket.middleware.js"

export const registerSocket = async (socket) => {
    const { data, valid } = await authentication({ socket })
    if (!valid) {
        return socket.emit("socket_Error", data)
    }
    socketConnection.set(data?.user._id.toString(), socket.id)
    
    return "Done"

}


export const logOutSocketId = async (socket) => {
    return socket.on("disconnect", async () => {
        const { data, valid } = await authentication({ socket })
        console.log({ data, valid })
        if (!valid) {
            return socket.emit("socket_Error", data)
        }
        socketConnection.delete(data?.user._id.toString())
        console.log(socketConnection)
        return "Done"
    })
}