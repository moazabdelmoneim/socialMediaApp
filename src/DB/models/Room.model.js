import mongoose,{Schema,model,Types} from "mongoose";


const RoomSchema= new Schema({
roomName:{type:String,required:true,unique:true},
usersId:[{type:Types.ObjectId,ref:"User",required:true}],
createdBy:{type:Types.ObjectId,ref:"User",required:true},
messages:[{
    type:String,
    senderId:{type:Types.ObjectId,ref:"User",required:true}
}]

},{timestamps:true})


export const roomModel= mongoose.models.Room||model("Room",RoomSchema)