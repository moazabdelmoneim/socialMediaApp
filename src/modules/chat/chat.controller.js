import { Router } from "express";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from './chat.validation.js'
import * as chatServices from './services/chat.services.js'
import { authentication} from "../../middlewares/auth.middleware.js";
const router=Router()


router.get('/:friendId',validation(validators.getChat),authentication(),chatServices.getChat)


router.post('/roomChat',authentication(),validation(validators.createRoomChat),chatServices.createRoomChat)
router.post('/roomChat/join/:roomId',authentication(),validation(validators.joinRoomChat),chatServices.joinRoomChat)

router.get('/roomChat/:roomId',validation(validators.getRoomChat),authentication(),chatServices.getRoomChat)

export default router