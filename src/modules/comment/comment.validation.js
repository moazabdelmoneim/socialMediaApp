import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

// Ensure generalFields.id exists
if (!generalFields.id || !generalFields.file) {
    throw new Error("generalFields.id or generalFields.file is not defined properly.");
}

export const createComment = joi.object({
    postId: generalFields.id.required(),
    commentId: generalFields.id,
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items(generalFields.file)
}).or('content', 'file');  // Ensures at least one field exists

export const updateComment = joi.object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items(generalFields.file)
}).or('content', 'file');

export const freezeComment = joi.object({
    commentId: generalFields.id.required(),
    postId: generalFields.id.required()
});

export const unFreezeComment = joi.object({
    commentId: generalFields.id.required(),
    postId: generalFields.id.required()
});
