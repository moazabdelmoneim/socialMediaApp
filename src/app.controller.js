import path from "node:path"
import userController from './modules/user/user.controller.js'
import postController from './modules/post/post.controller.js'
import regestrationController from "./modules/auth/auth.controller.js"
import chatController from "./modules/chat/chat.controller.js"
import { DBconnection } from "./DB/connection.js"
import { createHandler } from "graphql-http/lib/use/express"
import { schema } from "./modules/app.graph.js"
import cors from'cors'
import { globalError } from "./utils/response/error.js"


export const bootstrap=(app,express)=>{
    app.use(cors("*"))
    app.use(express.json())
    console.log(path.resolve("./src/uploads"));
    
    app.use("/uploads", express.static(path.resolve("./src/uploads")));
    app.get("/",(req,res,next)=>{
        return res.json({message:'welcome to this social media app'})
    })
    app.use('/graphQl',createHandler({schema:schema}))
    app.use("/auth",regestrationController)
    app.use("/user",userController)
    app.use('/post',postController)
    app.use('/chat',chatController)
    //db connection

    DBconnection()
    app.use(globalError) 
}

export default bootstrap 