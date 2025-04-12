import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import * as postGraphController from '../modules/post/post.graph.controller.js'
import * as userGraphController from '../modules/user/user.graph.controller.js'

export const schema= new GraphQLSchema({
query: new GraphQLObjectType({
name :"mainQuery",
description:"main Graph App",
fields:{
...postGraphController.query,
...userGraphController.query
}
}),
mutation: new GraphQLObjectType({
name:"mainMutation",
fields:{
    ...postGraphController.mutation
}

})

})