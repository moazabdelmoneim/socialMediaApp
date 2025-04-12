import userModel  from "../../../DB/models/user.model.js"
import { authentication } from "../../../middlewares/graphQl/auth.graph.middleware.js"
import { postModel } from '../../../DB/models/Post.model.js'
import * as DbServices from '../../../DB/db.service.js'
import { validation } from "../../../middlewares/graphQl/validation.graph.middleware.js"
import { likePostGraph } from "../post.validation.js"
export const likePost = async (parent, args) => {
    const { postId, authorization, action } = args;

    // Add logging to check input values

    // Check if postId or authorization are missing
    if (!postId || !authorization) {
        throw new Error("postId or authorization is missing or null");
    }

    validation(likePostGraph, args);

    const user = await authentication({ authorization });

    const data = action === "unlike" ? { $pull: { likes: user._id } } : { $addToSet: { likes: user._id } };
    
    const post = await DbServices.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: { $exists: false } },
    });
    if (!post) {
        throw new Error("Post not found");
    }

    console.log( post );
    
    const postOwner = await DbServices.findOne({ model: userModel, filter: { _id: post.userId } });
    if (!postOwner) {
        throw new Error("Post owner not found");
    }


    const updatedPost = await DbServices.findOneAndUpdate({
        model: postModel,
        filter: { _id: postId, isDeleted: { $exists: false } },
        data,
        options: { new: true }
    });

    return { message: "Done", status: 200, data: updatedPost };
};
