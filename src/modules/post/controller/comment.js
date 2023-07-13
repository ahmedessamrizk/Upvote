import { commentModel } from './../../../../DB/models/comment.model.js';
import { postModel } from './../../../../DB/models/post.model.js'

export const addComment = async (req, res) => {
    try {
        const { body } = req.body;
        const { postId } = req.params;
        const post = await postModel.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            res.status(404).json({ message: "Invalid post Id" });
        }
        else {
            const savedComment = await commentModel.create({ body, postId, userId: req.user._id });
            savedComment ? res.status(200).json({ message: "Done", savedComment }) : res.status(400).json({ message: "Fail to create comment" });
        }
    } catch (error) {
        res.status(400).json({ message: "catch error" })
        console.log(error);
    }
}

export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { body } = req.body;
        const updateComment = await commentModel.findOneAndUpdate({ _id: commentId, userId: req.user._id, isDeleted: false }, { body }, { new: true }).select('-isDeleted');
        updateComment ? res.status(200).json({ message: "Done", updateComment }) : res.status(403).json({ message: "Not authorized or invalid comment id" });
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await commentModel.findById(commentId);
        if (!comment || comment.deletedBy) {
            res.status(404).json({ message: "Invalid comment id" });
        } else {
            const post = await postModel.findById(comment.postId);
            if (!post || post.isDeleted) {
                res.status(404).json({ message: "Invalid post id" });
            } else {
                if ((JSON.stringify(req.user._id) == JSON.stringify(post.userId) || JSON.stringify(req.user._id) == JSON.stringify(comment.userId))) {
                    const deleteComment = await commentModel.updateOne({ _id: commentId }, { deletedBy: req.user._id })
                    res.status(200).json({ message: "Done" });
                }
                else
                    res.status(403).json({ message: "Not authorized or invalid comment id" });
            }
        }

    } catch (error) {
        res.status(400).json({ message: "catch error", error })
        console.log(error);
    }
}

export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await commentModel.findOneAndUpdate({ _id: commentId, likes: { $nin: req.user._id } }, { $push: { likes: req.user._id } }, { new: true }).select('-count');
        comment ? res.status(200).json({ message: "Done", comment }) : res.status(400).json({ message: "Already liked or invalid post Id" });
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const addReply = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { body } = req.body;
        const comment = await commentModel.findById(commentId); // parentComment
        if (comment.deletedBy || !comment) {
            res.status(404).json({ message: "Invalid comment id" });
        } else {
            const post = await postModel.findOne({ _id: comment.postId, isDeleted: false }); //first Replay on comment
            if (!post) {
                res.status(404).json({ message: "Invalid post Id" });
            }
            else {
                let savedReplay;
                if(comment.parentCommentId == null) //first Reply
                {
                    // console.log("reply to comment");
                    savedReplay = await commentModel.create({ body, postId: comment.postId, userId: req.user._id, parentCommentId: commentId , mainComment: commentId});
                    const test = await commentModel.findByIdAndUpdate(commentId, { $push: { replay: savedReplay._id }, parentComment: commentId});
                }
                else
                {
                    // console.log("reply to reply");
                    savedReplay = await commentModel.create({ body, postId: comment.postId, userId: req.user._id, parentCommentId: commentId , mainComment: comment.mainComment });
                    const test = await commentModel.findByIdAndUpdate(comment.mainComment, { $push: { replay: savedReplay._id }, parentComment: commentId, mainComment: comment.mainComment });
                }
                res.status(200).json({ message: "Done", savedReplay });
            }
        }
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
        console.log(error);
    }
}

export const getComment = async(req, res) => {
    try {
        const { id } = req.params;
        const comment = await commentModel.findOne({ _id:id, deletedBy: null, mainComment: null}).populate([
            {
                path:'postId',
                select:'-isDeleted',
                populate:[
                    {
                        path:'userId',
                        select:'userName profilePic'
                    },
                    {
                        path:'likes',
                        select:'userName profilePic'
                    }
                ]
            },
            {
                path:'userId',
                select:'userName profilePic'
            },
            {
                path: 'replay',
                select:'body userId parentCommentId',
                populate: [
                    {
                        path:'userId',
                        select:'userName profilePic'
                    },
                    {
                        path:'parentCommentId',
                        select:'userId',
                        populate:[
                            {
                                path:'userId',
                                select:'userName',
                            }
                        ]
                    }
                ]
            }
        ])
        comment? res.status(200).json({message: "Done", comment}) : res.status(404).json({message:"invalid comment id"})
    } catch (error) {
        res.status(400).json({message: "catch error", error})
    }
}
