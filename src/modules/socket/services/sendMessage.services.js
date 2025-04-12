import { authentication } from "../../../middlewares/socketIo/auth.socket.middleware.js"
import * as DbServices from '../../../DB/db.service.js'
import { chatModel } from "../../../DB/models/Chat.model.js"
import { socketConnection } from "../../../DB/models/user.model.js"


export const sendMessage = (socket) => {

    return socket.on("sendMessage", async (messageData) => {
        const { data, valid } = await authentication({ socket })
        if (!valid) {
            return socket.emit("socket_Error", data)
        }
        const userId = data.user._id // user that send message (sender)
        const { message, destId } = messageData
        console.log({ userId, message, destId })

        let chat = await DbServices.findOneAndUpdate({
            model: chatModel,
            filter: {
                $or: [
                    { mainUser: userId, subParticipant: destId },
                    { mainUser: destId, subParticipant: userId },
                ]
            },
            data: { $push: { messages: { message, senderId: userId } } },
            populate: [
                { path: "mainUser", select: "userName image" },
                { path: "subParticipant", select: "userName image" }
            ]
        });

        if (!chat) {
            await DbServices.create({
                model: chatModel,
                data: {
                    mainUser: userId,
                    subParticipant: destId,
                    messages: [{ message, senderId: userId }]
                }
            });

            chat = await DbServices.findOne({
                model: chatModel,
                filter: {
                    $or: [
                        { mainUser: userId, subParticipant: destId },
                        { mainUser: destId, subParticipant: userId },
                    ]
                },
                populate: [
                    { path: "mainUser", select: "userName image" },
                    { path: "subParticipant", select: "userName image" }
                ]
            });
        }
        socket.emit("successMessage", { chat, message })
        socket.to(socketConnection.get(destId)).emit("receiveMessage", { chat, message })
        return "Done"
    })

}
