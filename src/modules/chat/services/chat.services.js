import { asyncHandler } from "../../../utils/response/error.js";
import * as DbServices from '../../../DB/db.service.js'
import { chatModel } from "../../../DB/models/Chat.model.js";
import { successRes } from "../../../utils/response/successRes.js";
import  userModel  from "../../../DB/models/user.model.js";
import {roomModel} from '../../../DB/models/Room.model.js'
import { Socket } from "socket.io";
import { getIo } from "../../socket/socket.controller.js";



export const getChat = asyncHandler(async (req, res, next) => {
    const { friendId } = req.params
    const user = await DbServices.findOne({ model: userModel, filter: { _id: friendId, isDeleted: { $exists: false } } })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    const chat = await DbServices.findOne({
        model: chatModel,
        filter: {
            $or: [
                {
                    mainUser: req.user._id,
                    subParticipant: friendId

                },
                {
                    mainUser: friendId,
                    subParticipant: req.user._id

                },

            ]
        },
        populate: [
            {
                path: "mainUser",
                select: "userName image"
            },
            {
                path: "subParticipant",
                select: "userName image"
            },
        ]
    })
    return successRes({ res, data: { chat } })

})




export const createRoomChat = asyncHandler(async (req, res, next) => {
    const { roomName } = req.body
    const checkRoomChat = await DbServices.findOne({ model: roomModel, filter: { roomName } })
    if (checkRoomChat) {
        return next(new Error(" this room is already exist"))
    }
    const roomChat = await DbServices.create({
        model: roomModel,
        data: {
            roomName,
            createdBy: req.user._id

        }
    })
    return successRes({ res, status: 201, message: "room chat created successfully", data: { roomChat } })
})



export const joinRoomChat = asyncHandler(async (req, res, next) => {
    const { userId } = req.body
    const { roomId } = req.params
    const room = await DbServices.findOne({ model: roomModel, filter: { _id: roomId } })
    if (!room) {
        return next(new Error(" in valid room"))
    }

    const user = await DbServices.findOne({ model: userModel, filter: { _id: userId } })
    if (!user) {
        return next(new Error(`user not found`, { cause: 404 }))
    }

    if (room.usersId?.includes(userId)) {
        return next(new Error(" user is already in chat", { cause: 409 }))
    }
    room.usersId?.push(userId)
    await room.save()
    getIo().to(room.usersId).emit("userJoined", {
        userId,
        user: user.userName,
        message: `${user.userName} has joined the chat`
    })

    return successRes({ res, message: "joined successfully", data: { room } })
})





export const getRoomChat = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params
    if (!await DbServices.findOne({ model: roomModel, filter: { _id: roomId } })) {
        return next(new Error(" in valid room chat"))
    }
    return successRes({ res })


})