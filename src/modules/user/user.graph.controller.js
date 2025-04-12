
import * as userTypeGraph from './types/user.graph.types.js'
import * as userGraphQueryServices from './services/user.graph.query.service.js'
import { GraphQLString } from 'graphql'


export const query= {
    getAllUSers:{
        type: userTypeGraph.getAllUsers,
        resolve: userGraphQueryServices.getAllusers
    },
    userProfile:{
        type:userTypeGraph.userProfile,
        args:{
            authorization:{type:GraphQLString}
        },
        resolve:userGraphQueryServices.userProfile
    }
}