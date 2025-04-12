import commentController from'../comment/comment.controller.js'
import { Router } from "express";
import { authentication, authorization } from "../../middlewares/auth.middleware.js";
import { endpoints } from "./post.authorization.js";
import { uploadCloud } from "../../utils/multer/cloud.multer.js";
import * as postValidatiors from './post.validation.js'
import { archivePost, createPost, freezePost, friendsPosts, likePost, publicPosts, restorePost, undoPost, updatedPost } from "./services/post.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { fileValidationTypes } from "../../utils/multer/local.malter.js";
const router=Router()

router.use('/:postId/comment',commentController)
router.post("/",
    authentication(),
    authorization(endpoints.createPost),
    uploadCloud(fileValidationTypes).array('attachment',2),
    validation(postValidatiors.createPost),
    createPost
)
router.patch("/update/:postId",
    authentication(),
    authorization(endpoints.createPost),
    uploadCloud(fileValidationTypes).array('attachment',2),
    validation(postValidatiors.updatePost),
    updatedPost
)
router.delete("/delete/:postId",
    authentication(),
    authorization(endpoints.freezePost),
    validation(postValidatiors.freezePost),
    freezePost
)
router.patch('/undo/:postId',
    authentication(),
    authorization(endpoints.createPost),
    validation(postValidatiors.undoPost),
    undoPost
)
router.patch('/restore/:postId',
    authentication(),
    authorization(endpoints.createPost),
    validation(postValidatiors.restorePost),
    restorePost
)

router.patch('/archive/:postId',
    authentication(),
    authorization(endpoints.createPost),
    validation(postValidatiors.archivePost),
    archivePost
)

router.patch('/like/:postId',
    authentication(),
    authorization(endpoints.createPost),
    validation(postValidatiors.likePost),
    likePost
)

router.get('/posts',
    publicPosts
)

router.get('/friends-posts',
    authentication(),
    authorization(endpoints.createPost),
    friendsPosts
)

export default router 