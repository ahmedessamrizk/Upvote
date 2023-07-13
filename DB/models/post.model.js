import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    body: {type: String, required: true},
    picture: {type: String, required: true},
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
    likes: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    unLikes: [{type: mongoose.Types.ObjectId, ref: 'User'}],
    isDeleted: {type: Boolean, default: false},
    count: Number
},{
    timestamps: true
})


postSchema.post('findOneAndUpdate', async function() {
    const docToUpdate = await this.model.findOne({_id:this.getQuery()._id});
    console.log(docToUpdate); // The document that `findOneAndUpdate()` will modify
    docToUpdate.count = docToUpdate.likes.length - docToUpdate.unLikes.length;
    docToUpdate.save();
  });
export const postModel = mongoose.model('Post', postSchema);