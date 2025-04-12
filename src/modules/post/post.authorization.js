import { roleTypes } from "../../DB/models/user.model.js";

export const endpoints={
    createPost:[roleTypes.User],
    freezePost:[roleTypes.Admin,roleTypes.User]
}