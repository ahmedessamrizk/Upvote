import { Router } from 'express'
import * as postController from './controller/post.js'
import {auth} from '../../middleware/auth.js'
import { myMulter, fileFormat, HME } from './../../services/multer.js';
import { endPoint } from './post.endPoint.js';
import * as commentController from './controller/comment.js'

const router = Router();

router.post('/addPost', auth(endPoint.addPost), myMulter(fileFormat.image).single('image'), HME, postController.addPost);
router.patch('/updatePost/:id', auth(endPoint.updatePost), myMulter(fileFormat.image).single('image'), HME, postController.updatePost);
router.patch('/deletePost/:id', auth(endPoint.deletePost), postController.deletePost);
router.patch('/likePost/:id', auth(endPoint.deletePost), postController.likePost);
router.patch('/unLikePost/:id', auth(endPoint.deletePost), postController.unLikePost);
router.get('/getPosts', auth(endPoint.getPosts),postController.getOwnPosts);
router.get('/',postController.getPosts);
router.post('/:postId/addComment/', auth(endPoint.addComment), commentController.addComment)
router.patch('/updateComment/:commentId', auth(endPoint.addComment), commentController.updateComment)
router.patch('/deleteComment/:commentId', auth(endPoint.addComment), commentController.deleteComment)
router.patch('/likeComment/:commentId', auth(endPoint.addComment), commentController.likeComment)
router.post('/comment/:commentId/addReplay', auth(endPoint.addComment), commentController.addReply)
router.get('/comment/:id',commentController.getComment)

export default router