import cloudinary from './../../../services/cloudinary.js';
import { postModel } from './../../../../DB/models/post.model.js';
import { paginate } from './../../../services/pagination.js';


export const addPost = async (req, res) => {
    try {
        if (!req.file) {
            res.status(404).json({ message: "Plz upload the post's image" });
        }
        else {
            const { secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `User/${req.user._id}/Posts` })
            const { body } = req.body;
            const savedPost = await postModel.create({ body, userId: req.user._id, picture: secure_url });
            savedPost ? res.status(201).json({ message: "Done" }) : res.status(400).json({ message: "Fail to create the post" })
        }
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const updatePost = async (req, res) => {
    try {
        if (req.file) {
            const { id } = req.params;
            const { secure_url } = await cloudinary.uploader.upload(req.file.path, { folder: `User/${req.user._id}/Posts` })
            const { body } = req.body;
            const updatedPost = await postModel.findOneAndUpdate({ _id: id, userId: req.user._id }, { picture: secure_url, body }, { new: true }).select('-isDeleted');
            updatedPost ? res.status(200).json({ message: "Done", updatedPost }) : res.status(403).json({ message: "Not authorized or invalid post id" });
        } else {
            const { id } = req.params;
            const { body } = req.body;
            const updatedPost = await postModel.findOneAndUpdate({ _id: id, userId: req.user._id }, { body }, { new: true }).select('-isDeleted');
            updatedPost ? res.status(200).json({ message: "Done", updatedPost }) : res.status(403).json({ message: "Not authorized or invalid post id" });
        }
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletePost = await postModel.updateOne({ _id: id, userId: req.user._id }, { isDeleted: true });
        deletePost.modifiedCount ? res.status(200).json({ message: "Done" }) : res.status(403).json({ message: "Not authorized or invalid post id" });
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postModel.findOneAndUpdate({ _id: id, likes: { $nin: req.user._id }, isDeleted:false }, { $push: { likes: req.user._id }, $pull: { unLikes: req.user._id } }, { new: true }).select('-count');
        post ? res.status(200).json({ message: "Done", post }) : res.status(400).json({ message: "Already liked or invalid post Id" });
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const unLikePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postModel.findOneAndUpdate({ _id: id, unLikes: { $nin: req.user._id } , isDeleted:false}, { $push: { unLikes: req.user._id }, $pull: { likes: req.user._id } }, { new: true }).select('-count');
        post ? res.status(200).json({ message: "Done", post }) : res.status(400).json({ message: "Already unLiked or invalid post Id" });
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const getPosts = async (req, res) => {
    try {
        const { page, size } = req.query;
        const { limit, skip } = paginate(page, size);
        const posts = await postModel.find({ isDeleted: false }).limit(limit).skip(skip).populate([
            {
                path: 'userId',
                select: 'userName profilePic email coverPic'
            },
            {
                path: 'likes',
                select: 'userName'
            },
            {
                path: 'unLikes',
                select: 'userName'
            }
        ]).select('-isDeleted')
        res.status(200).json({ message: "Done", posts })
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
    }
}

export const getOwnPosts = async (req, res) => {
    try {
        const { page, size } = req.query;
        const { limit, skip } = paginate(page, size);
        const posts = await postModel.find({ userId: req.user._id, isDeleted: false }).limit(limit).skip(skip).populate([
            {
                path: 'likes',
                select: 'userName'
            },
            {
                path: 'unLikes',
                select: 'userName'
            }
        ]).select('-isDeleted')
        res.status(200).json({ message: "Done", posts })
    } catch (error) {
        res.status(400).json({ message: "catch error", error })
        console.log(error);
    }
}