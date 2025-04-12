import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const getChat= joi.object().keys({
friendId:generalFields.id.required()
}).required()


export const createRoomChat= joi.object().keys({
    roomName:joi.string().required()
    }).required()
    

export const joinRoomChat= joi.object().keys({
userId:generalFields.id.required(),
roomId:generalFields.id.required()
}).required()


export const getRoomChat= joi.object().keys({
roomId:generalFields.id.required()
}).required()