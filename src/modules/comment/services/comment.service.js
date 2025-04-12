import * as DbServices from '../../../DB/db.service.js'
import { postModel } from '../../../DB/models/Post.model.js';
import  cloud from "../../../utils/multer/cloudinary.js";
import { successRes } from "../../../utils/response/successRes.js";

import commentModel from '../../../DB/models/Comment.model.js';
import { roleTypes } from '../../../DB/models/user.model.js';
import { asyncHandler } from '../../../utils/response/error.js';

export const createComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;

    if (!req.user?._id) {
        return next(new Error("Unauthorized: userId is required", { cause: 401 }));
    }

    if (commentId && !await DbServices.findOne({ model: commentModel, filter: { _id: commentId, postId, isDeleted: { $exists: false } } })) {
        return next(new Error("Invalid parent comment"));
    }

    const post = await DbServices.findOne({ model: postModel, filter: { _id: postId, isDeleted: { $exists: false } } });
    if (!post) {
        return next(new Error("Post not found", { cause: 404 }));
    }

    if (req.files?.length) {
        let attachments = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `${process.env.APP_CLOUD_NAME}/user/${post.createdBy}/post/${postId}/comment` });
            attachments.push({ secure_url, public_id });
        }
        req.body.attachment = attachments;
    }

    req.body.userId = req.user._id;

    const comment = await DbServices.create({
        model: commentModel,
        data: {
            postId,
            createdBy: req.user._id,
            commentId,
            ...req.body,
        },
    });

    return successRes({ res, status: 201, message: "Comment created successfully", data: { comment } });
});




export const updateComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params;

    const comment = await DbServices.findOne({
        model: commentModel, filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        populate: [{
            path: "postId"
        }]

    })
    if (!comment) {
        return next(new Error("Comment not found or unauthorized", { cause: 404 }));
    }

    let updatedData = { ...req.body };


    if (req.files?.length) {
        let attachments = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
                folder: `${process.env.APP_CLOUD_NAME}/user/${comment.createdBy}/post/${postId}/comment`
            });
            attachments.push({ secure_url, public_id });
        }
        updatedData.attachments = attachments;
    }

    
    const updatedComment = await DbServices.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        data: updatedData,
        options: { new: true }
    });

    if (!updatedComment) {
        return next(new Error("Failed to update comment", { cause: 500 }));
    }

    return successRes({ res, message: "Comment updated successfully", data: { updatedComment } });
});



export const freezeComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params
    const comment = await DbServices.findOne({
        model: commentModel, filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        populate: [{
            path: "postId"
        }]

    })
    console.log(comment);
    
    if (!comment) {
        return next(new Error("comment not found", { cause: 404 }))
    }
    // if (!comment || (comment.createdBy.toString() != req.user._id.toString()
    //     && comment.postId.createdBy.toString() != req.user._id.toString()
    //     && req.user.role != roleTypes.Admin
    // )) {
    //     return next(new Error("in valid comment or you are not authorized", { cause: 404 }))
    // }
    const freezedComment = await DbServices.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: false } },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id

        },
        options: { new: true }

    })

    return successRes({ res, message: "comment deleted successfully", data: { freezedComment } })
})



export const unFreezeComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId } = req.params
    const comment = await DbServices.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: true } },
        data: {
            $unset: { isDeleted: 1, deletedBy: 1 },
            updatedBy: req.user._id
        },
        options: { new: true }
    })

    return successRes({ res, message: "comment retreived successfully", data: { comment } })
})