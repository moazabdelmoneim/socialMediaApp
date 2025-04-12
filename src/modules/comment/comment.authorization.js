import { roleTypes } from "../../DB/models/user.model.js"
export const endPiont={
User:[roleTypes.User],
UserAndAdmin:[roleTypes.User,roleTypes.Admin]
}