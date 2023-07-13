import { Router } from 'express'
import * as userController from'./controller/user.js'
import { auth } from './../../middleware/auth.js';
import { endPoint } from './user.endPoint.js';
import { myMulter, fileFormat, HME } from './../../services/multer.js';

const router = Router();

router.patch('/profile/update', auth(endPoint.updateProfile) ,userController.updateProfile)
router.patch('/softDelete/:id', auth(endPoint.softDelete), userController.softDeleteAccount)
router.patch('/profilePic', auth(endPoint.profilePic) ,myMulter(fileFormat.image).single('image'), HME, userController.addProfilePic)
router.patch('/covPic', auth(endPoint.profilePic) ,myMulter(fileFormat.image).array('image',5), HME, userController.addCoverPic)
router.patch('/block/:id', auth(endPoint.blockUser), userController.blockUser)
router.get('/',userController.getUsers)

export default router