import * as userValidator from "./user.validation.js"
import * as userServices from './services/user.service.js'
import { Router } from "express";
import { authentication, authorization } from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { endpoints } from "./user.endpoints.js";
import { fileValidationTypes, uploadDiskFile } from "../../utils/multer/local.malter.js";
import { uploadCloud } from "../../utils/multer/cloud.multer.js";


const router =Router()

//get crud

router.get("/profile",authentication(),userServices.profile)

router.get("/profile/:profileId",validation(userValidator.shareProfile),authentication(),userServices.shareProfile)


//update crud

router.patch("/profile",validation(userValidator.updateProfileValidation), authentication(),
    authorization(endpoints.profile),
    userServices.updateProfile)

router.patch("/profile/Password",validation(userValidator.passwordValidation), authentication(),
    authorization(endpoints.profile),
    userServices.updatePassword) 

router.patch("/profile/email",validation(userValidator.updateEmail),authentication(),userServices.updateEmail)

router.patch("/profile/replace-email",validation(userValidator.replaceEmail),authentication(),userServices.replaceEmail)

router.patch("/profile/image",
    authentication(),
    //uploadDiskFile("user",fileValidationTypes.image).single("image"),
    uploadCloud(fileValidationTypes.image).single('image'),
    userServices.updateImage
)

router.patch("/profile/cover-images",
    authentication(),
    // uploadDiskFile("user/coverImages",fileValidationTypes.image).array("image",5),
    uploadCloud(fileValidationTypes.image).array("image",2),
    userServices.coverImages 
)


// add friend 

router.patch('/profile/friendRequest/:friendId',validation(userValidator.friendRequest),authentication(),authorization(endpoints.addAndAccept),userServices.friendRequest)
router.patch('/profile/acceptFriendRequest/:friendRequestId',validation(userValidator.acceptFriendRequest),authentication(),authorization(endpoints.addAndAccept),userServices.acceptFriendRequest)

export default router 
