import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    body: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    unLikes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    deletedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Types.ObjectId, ref: 'Post', required: true },
    replay: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    mainComment : {type: mongoose.Types.ObjectId, ref: 'Comment'},
    parentCommentId: {type: mongoose.Types.ObjectId, ref: 'Comment'}
},
    {
        timestamps: true
    })

export const commentModel = mongoose.model('Comment', commentSchema)