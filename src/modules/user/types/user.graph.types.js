import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { attachments } from "../../../utils/app.graph.share.types.js";


export const oneUserResponse = {
    _id: { type: GraphQLID },

    userName: { type: GraphQLString },

    image: { type: attachments },

    email: { type: GraphQLString },

    address: { type: GraphQLString },

    coverImage: { type: new GraphQLList(attachments) },

    DOB: { type: GraphQLString },

    phone: { type: GraphQLString },

    gender: {
        type: new GraphQLEnumType({
            name: "genderTypes",
            values: {
                male: { type: GraphQLString },
                female: { type: GraphQLString }

            }
        })
    },

    role: {
        type: new GraphQLEnumType({
            name: "roleTypes",
            values: {
                user: { type: GraphQLString },
                admin: { type: GraphQLString },
                superAdmin: { type: GraphQLString },

            }
        })
    },
    provider: {
        type: new GraphQLEnumType({
            name: "providerTypes",
            values: {
                system: { type: GraphQLString },
                google: { type: GraphQLString }

            }
        })
    },



}





export const getAllUsers = new GraphQLObjectType({
    name: "getAllUsers",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLInt },

        data: {
            type: new GraphQLList(
                new GraphQLObjectType({
                    name: "oneUserResponse",
                    fields: {
                        ...oneUserResponse,

                        viewers: {
                            type: new GraphQLList(
                                new GraphQLObjectType({
                                    name: "viewers",
                                    fields: {
                                        ...oneUserResponse,
                                        time: { type: new GraphQLList(GraphQLString) }
                                    }
                                })


                            )
                        },
                    }
                })
            )
        },

        updatedBy: { type: GraphQLID },

    }

})


export const userProfile = new GraphQLObjectType({
    name: "userProfile",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLInt },
        data: {
            type: new GraphQLObjectType({
                name: "userProfileResponse",
                fields: {
                    ...oneUserResponse
                }
            })
        }
    }


})