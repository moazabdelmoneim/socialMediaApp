import userModel from "../../../DB/models/user.model.js";
import path from "node:path";
import fs from "node:fs"
import * as dbService from '../../../DB/db.service.js'
import { asyncHandler } from "../../../utils/response/error.js";
import { successRes } from "../../../utils/response/successRes.js";
import { compareHash, generateHash } from "../../../utils/security/hashing.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import  cloud  from "../../../utils/multer/cloudinary.js";
import { friendRequetModel } from "../../../DB/models/FriendRequest.model.js";





export const profile=asyncHandler(async(req,res,next)=>{
    const user= await dbService.findOne({model:userModel,
        filter:{_id:req.user._id},
        select:("userName email image coverImage viewers "),
        populate:[
            {
            path:"viewers",
            select:"userName image -_id"
            },
            {
                path:"friends",
                select:"userName"
            }
    ]
    })
    return successRes({res,data:{user}})
})



export const shareProfile = asyncHandler(async (req, res, next) => {
    const { profileId } = req.params;


    if (!req.user || !req.user._id) {
        return next(new Error("Unauthorized access", { cause: 401 }));
    }

    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: profileId, isDeleted: false },
        select: "userName email DOB profileImage",
    });

    if (!user) {
        return next(new Error("Invalid user ID", { cause: 404 }));
    }

    if (profileId !== req.user._id.toString()) {
        await dbService.updateOne({
            model: userModel,
            filter: { _id: profileId },
            data: {
                $addToSet: { viewers: { userId: req.user._id, time: Date.now() } },
            },
        });
    }

    return successRes({ res, data: { user } });
});

// update basic profile

export const updateProfile = asyncHandler(async (req, res, next) => {
    const user = await userModel.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    return successRes({
        res,
        message: "Updated successfully",
        data: { user },
    });
});





// updating password

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { password, oldPassword } = req.body;

    if (!( compareHash({ plainText: oldPassword, hashed: req.user.password }))) {
        return next(new Error("Invalid old password", { cause: 409 }));
    }

    const compare = await compareHash({ plainText: password, hashed: req.user.password });

    if (compare) {
        const error = new Error("New password must be different from the old password");
        error.status = 400;
        return next(error);
    }

    const hashedPassword = await generateHash({ plainText: password });

    const user = await userModel.findByIdAndUpdate(
        req.user._id,
        {
            password: hashedPassword,
            changeCredentialTime: new Date(),
        },
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    return successRes({
        res,
        message: "Password updated successfully",
        data: { id: user._id, updatedAt: user.updatedAt },
    });
});


// update email with 2 step verification 
export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body

    if (await dbService.findOne({ model: userModel, filter: { email } })) {
        return next(new Error('email already exist', { cause: 409 }))
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            tempEmail: email
        }
    })

    emailEvent.emit("sendUpdateEmail", { id: req.user._id, email: req.user.tempEmail })  // send code to the new email 
    emailEvent.emit('sendConfirmEmail', { id: req.user._id, email: req.user.email })// send code to the old account

    return successRes({
        res,
        message: "check your mailBox in 2 emails",
        data: {},
    });
});

export const replaceEmail = asyncHandler(async (req, res, next) => {
    const { oldEmailCode, code } = req.body
    if (await dbService.findOne({ model: userModel, filter: { email: req.user.tempEmail } })) {
        return next(new Error('email already exist', { cause: 409 }))
    }
    if (!compareHash({ plainText: oldEmailCode, hashed: req.user.updateEmailOtp })) {
        return next(new Error('invalid oldEmailCode', { cause: 400 }))
    }
    if (!compareHash({ plainText: code, hashed: req.user.otp })) {
        return next(new Error('invalid oldEmailCode', { cause: 400 }))
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            email: req.user.tempEmail,
            changeCredentialTime: Date.now(),
            $unset: {
                tempEmail: 0,
                otp: 0,
                updateEmailOtp: 0
            }

        }

    })
    return successRes({
        res,
        message: "Email updated successfully",
        data: {},
    });
})

// images 
export const updateImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("No file uploaded", { cause: 400 }));
    }

    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
        folder: `userProfile/${req.user._id}`
    });

    const existingUser = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id }   
    });

    if (!existingUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if (existingUser.image?.public_id) {
        await cloud.uploader.destroy(existingUser.image.public_id);
    }

    const updatedUser = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: { $set: { image: { secure_url, public_id } } },
        options: { new: true }
    });

    if (!updatedUser) {
        return next(new Error("User not found after update", { cause: 404 }));
    }

    return successRes({ res, data: updatedUser });
});

export const coverImages = asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new Error("No files uploaded", { cause: 400 }));
    }

    const images = await Promise.all(
        req.files.map(async (file) => {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
                folder: `userProfile/${req.user._id}/cover`
            });
            return { secure_url, public_id };
        })
    );

    const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImages: images } },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    return successRes({ res, data: updatedUser });
});




export const friendRequest= asyncHandler(async(req,res,next)=>{
    const {friendId}=req.params
    const checkUser= await dbService.findOne({model:userModel,
        filter:{_id:friendId}
    })
    if(!checkUser){
        return next(new Error("user not found",{cause:404}))
    }
    if(friendId.toString()===req.user._id.toString()){
        return next( new Error("can't add yourself"))
    }
    const friendRequest= await dbService.create({model:friendRequetModel,
        data:{
            friendId,
            createdBy:req.user._id
        }
    })
    return successRes({res,status:201,message:"sent successfully",data:{friendRequest}})
    })
    
    
    
    export const acceptFriendRequest= asyncHandler(async(req,res,next)=>{
    const{friendRequestId}=req.params
    
    const friendRequest= await dbService.findOneAndDelete({
        model:friendRequetModel,
        filter:{
            _id:friendRequestId,
            friendId:req.user._id,  
            status:false,
    
        }
    })
    if(!friendRequest){
        return next( new Error("in-valid Id"))
    }
    
    await dbService.updateOne({model:userModel,
        filter:{
            _id:friendRequest.createdBy
        },
        data:{
            $addToSet:{friends:friendRequest.friendId }
    }
    
    })
    
    await dbService.updateOne({model:userModel,
        filter:{
            _id:req.user._id
        },
        data:{
            $addToSet:{friends:friendRequest.createdBy }
    }
    
    })
    return successRes({res,status:200,message:"friend  added successfully"})
    })