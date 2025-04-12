
import * as postGraphQueryServices from './services/post.graph.query.service.js'
import * as postGraphTypes from './types/post.graph.types.js'
import * as postMutationServices from './services/post.graph.mutation.service.js'
import { GraphQLEnumType, GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql'

export const query = {
    postList: {
        type: postGraphTypes.getAllPosts,
        resolve: postGraphQueryServices.postList
    }
}

export const mutation = {
    likePost: {
        type: postGraphTypes.likePost,
        args: {
            postId: { type: new GraphQLNonNull(GraphQLID) },
            authorization: { type: new GraphQLNonNull(GraphQLString) },
            action: {
                type: new GraphQLEnumType({
                    name: "actionTypes",
                    values: {
                        like: { value: "like" },  
                        unlike: { value: "unlike" },
                    }
                })
            }
        },
        resolve: postMutationServices.likePost
    }
};