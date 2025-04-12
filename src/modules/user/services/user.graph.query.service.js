import * as DbServices from '../../../DB/db.service.js'
import  userModel  from '../../../DB/models/user.model.js'
import { authentication } from '../../../middlewares/graphQl/auth.graph.middleware.js'
import { validation } from '../../../middlewares/graphQl/validation.graph.middleware.js'
import { userProfileGraph } from '../user.validation.js'

export const getAllusers = async (parent, args) => {
    const users = await DbServices.find({ model: userModel })
    return { message: "Done", status: 200, data: users }

}




export const userProfile = async (parent, args) => {
    const { authorization } = args
    await validation(userProfileGraph, args)
    const user = await authentication({ authorization })
    console.log(user);

    await DbServices.findOne({
        model: userModel,
        filter: { _id: user._id, isDeleted: { $exists: false } }
    })

    return ({ message: "Done", status: 200, data: user })
}