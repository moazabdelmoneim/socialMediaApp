import { Router } from "express";
import { endPiont } from "./comment.authorization.js";
import * as validators from './comment.validation.js'
import * as commentServices from './services/comment.service.js'
import { fileValidationTypes } from "../../utils/multer/local.malter.js";
import { uploadCloud } from "../../utils/multer/cloud.multer.js";
import { authentication, authorization } from "../../middlewares/auth.middleware.js";
// import { validation } from "../../middlewares/validation.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
const router=Router({
    mergeParams:true,
    caseSensitive:true
})

router.post('/',authentication(),authorization(endPiont.User),uploadCloud(fileValidationTypes.image).array('attachment',2),validation(validators.createComment),commentServices.createComment)

router.patch('/update/:commentId',authentication(),authorization(endPiont.User),uploadCloud(fileValidationTypes.image).array('attachment',2),validation(validators.updateComment),commentServices.updateComment)
router.delete('/delete/:commentId',authentication(),authorization(endPiont.UserAndAdmin),validation(validators.freezeComment),commentServices.freezeComment)
router.patch('/:commentId/unFreezed',authentication(),authorization(endPiont.UserAndAdmin),validation(validators.unFreezeComment),commentServices.unFreezeComment)

export default router