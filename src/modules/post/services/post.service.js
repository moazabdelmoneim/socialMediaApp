import { asyncHandler } from "../../../utils/response/error.js";
import * as dbService from "../../../DB/db.service.js";
import cloud from '../../../utils/multer/cloudinary.js';
import { postModel, privacyTypes } from "../../../DB/models/Post.model.js";
import { successRes } from "../../../utils/response/successRes.js";
import { roleTypes } from "../../../DB/models/user.model.js";

export const createPost = asyncHandler(async (req, res, next) => {
    const { bio } = req.body;
    const attachments = [];

    if (req.files?.length) {
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: 'post' });
            attachments.push({ secure_url, public_id });
        }
        req.body.attachments = attachments;
    }

    const post = await dbService.create({
        model: postModel,
        data: { ...req.body, userId: req.user._id }
    });

    return successRes({ res, status: 201, data: post });
});

export const freezePost = asyncHandler(async (req, res, next) => {
    
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter:{ _id: req.params.postId,},
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id,
            updatedBy: req.user._id
        },
        options: { new: true }
    });
    

    return post ? successRes({ res, status: 200, data: post }) : next(new Error("Invalid post ID", { cause: 404 }));
});

export const publicPosts = asyncHandler(async (req, res, next) => {
    const populateList = [
        { path: "userId", select: 'username image' },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' }
    ];

    const posts = await dbService.findAll({
        model: postModel, 
        populate: populateList
    });

    return successRes({ res, data: { posts }, status: 200 });
});

export const friendsPosts = asyncHandler(async (req, res, next) => {
    const populateList = [
        { path: "userId", select: 'username image' },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' }
    ];

    const posts = await dbService.findAll({
        model: postModel,
        filter: {
            isDeleted: { $exists: false },
            archive: { $exists: false },
            userFriends: req.user._id
        },
        populate: populateList
    });

    return successRes({ res, data: { posts }, status: 201 });
});

export const updatedPost = asyncHandler(async (req, res, next) => {
    if (req.files?.length) {
        const attachments = [];
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "post" });
            attachments.push({ secure_url, public_id });
        }
        req.body.attachments = attachments;
    } else {
        req.body.attachments = [];
    }

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
            userId: req.user._id
        },
        data: {
            ...req.body,
            userId: req.user._id
        },
        options: { new: true }
    });


    return post ? successRes({ res, data: { post }, status: 200 }) : next(new Error("Invalid post ID", { cause: 404 }));
});

export const undoPost = asyncHandler(async (req, res, next) => {
    const post = await dbService.findOne({
        model: postModel,
        filter: { _id: req.params.postId, userId: req.user._id }
    });

    if (!post) return next(new Error("Invalid post ID", { cause: 404 }));
    if (!post.isDeleted || Date.now() - post.isDeleted >= 120000) {
        return next(new Error("Cannot undo, time exceeded", { cause: 400 }));
    }

    const updatedPost = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId, userId: req.user._id },
        data: { $unset: { isDeleted: "", deletedBy: "" } },
        options: { new: true }
    });

    return successRes({ res, data: { updatedPost }, status: 200 });
});

export const likePost = asyncHandler(async (req, res, next) => {
    const action = req.query.action?.toLowerCase?.();
    const data = action === 'like' ? { $addToSet: { likes: req.user._id } } : { $pull: { likes: req.user._id } };

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId },
        data,
        options: { new: true }
    });

    return post ? successRes({ res, data: { post }, status: 200 }) : next(new Error("Invalid post ID", { cause: 404 }));
});

export const archivePost = asyncHandler(async (req, res, next) => {
    let post = await dbService.findOne({
        model: postModel,
        filter: { _id: req.params.postId, isDeleted: { $exists: false }, userId: req.user._id }
    });

    if (!post) return next(new Error("Invalid post ID", { cause: 404 }));



    post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId, isDeleted: { $exists: false }, userId: req.user._id },
        data: { archive: true },
        options: { new: true }
    });

    return post ? successRes({ res, data: { post }, status: 200 }) : next(new Error("Invalid post ID", { cause: 404 }));
});


export const restorePost = asyncHandler(async (req, res, next) => {
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: true },
            deletedBy: req.user._id
        },
        data: {
            $unset: { isDeleted: "", deletedBy: "" }
        },
        options: { new: true }
    });

    return post 
        ? successRes({ res, data: { post }, status: 200 }) 
        : next(new Error("Invalid post ID", { cause: 404 }));
});
