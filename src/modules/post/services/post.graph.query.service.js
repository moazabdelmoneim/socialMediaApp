import * as DbServices from '../../../DB/db.service.js'
import { postModel } from '../../../DB/models/Post.model.js'



export const postList = async (parent, args) => {
    const posts = await DbServices.find({
        model: postModel
        , populate: [{
            path: "createdBy"
        }]
    })

    return ({ message: "Done", status: 200, data: posts })
} 