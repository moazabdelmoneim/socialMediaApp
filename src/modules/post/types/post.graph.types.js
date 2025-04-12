import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"
import { attachments } from "../../../utils/app.graph.share.types.js"
import { oneUserResponse } from "../../user/types/user.graph.types.js"


export const post = new GraphQLObjectType({
    name: "onePostResponse",
    fields: {
        _id: { type: GraphQLID },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(attachments) },
        likes: { type: new GraphQLList(GraphQLID) },
        createdBy: {
            type: new GraphQLObjectType({
                name: "createdBy",
                fields: {
                    ...oneUserResponse,
                    viewers: {
                        type: new GraphQLList(
                            new GraphQLObjectType({
                                name: "viewersToPopulate",
                                fields: {
                                    ...oneUserResponse,
                                    time: { type: new GraphQLList(GraphQLString) }
                                }

                            })
                        )
                    },
                }
            })
        },

        updatedBy: { type: GraphQLID },
        deletedBy: { type: GraphQLID },
        updatedAt: { type: GraphQLString },
        createdAt: { type: GraphQLString }

    }
})




export const getAllPosts =
    new GraphQLObjectType({
        name: "postResponse",
        description: " respone on one post",
        fields: {
            message: { type: GraphQLString },
            status: { type: GraphQLInt },
            data: { type: new GraphQLList(post) }
        }

    })


export const likePost =
    new GraphQLObjectType({
        name: "likePost",
        description: " like post",
        fields: {
            message: { type: GraphQLString },
            status: { type: GraphQLInt },
            data: { type: post }
        }

    })