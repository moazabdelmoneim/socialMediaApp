
import mongoose, { Types, Schema, model } from "mongoose";



export const roleTypes = {
    User: 'user',
    Admin: 'admin'
}
const genderType = { male: 'male', femal: 'female' }
const userSchema = new Schema({

    userName: {
        type: String,
        required: [true, 'please enter your name'],
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    tempEmail: String,

    otp: String,
    updateEmailOtp: String,
    forgetPasswordOtp: String,
    password: {
        type: String,
        required: true
    },
    phone: String,
    gender: {
        type: String,
        enum: Object.values(genderType),
        default: 'male'
    },
    image: {
        secure_url: String,
        public_id: String
    },
    coverImages: [{
        secure_url: String,
        public_id: String
    }],
    DOB: Date,
    confirmEmail: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.User,
    },
    changeCredentialTime: Date,
    changePasswordTime: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    viewers: [{ userId: { type: Types.ObjectId, ref: 'User' }, time: Date }],
    friends: [{ type: Types.ObjectId, ref: 'User' }]
}, { timestamps: true })


const userModel = mongoose.model.User || model("User", userSchema)
export default userModel
export const  socketConnection= new Map()