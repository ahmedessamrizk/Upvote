import bcrypt  from 'bcryptjs';
import { userModel } from './../../../../DB/models/user.model.js';
import { sendEmail } from './../../../services/email.js';
import jwt from 'jsonwebtoken'
import cloudinary from './../../../services/cloudinary.js';
import { postModel } from './../../../../DB/models/post.model.js';
import { commentModel } from './../../../../DB/models/comment.model.js';
import { paginate } from './../../../services/pagination.js';

export const updateProfile = async(req, res) => {
    try {
        const { userName, email, age, phone, password } = req.body;
        const user = await userModel.findById(req.user._id);
        const compare = bcrypt.compareSync(password, user.password);
        if (compare) {
            const updatedUser = await userModel.findByIdAndUpdate(user._id, {userName, email, age, phone}, {new:true}).select('userName email age phone');
            res.status(200).json({message: "Done", updatedUser});
            if (email) {
                await userModel.updateOne({_id: user._id}, {confirmEmail: false});
                const token = jwt.sign({id:updatedUser._id}, process.env.EMAILTOKEN, {expiresIn:'1h'});
                const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
                await sendEmail(email, 'Email Confirmation', `<a href = ${link}> Please follow me to confirm ur email </a>`);
            }
        } else {
            res.status(401).json({message: "Invalid password"})
        }
    } catch (error) {
        res.status(400).json({message: "catch error", error})
    }
}

export const softDeleteAccount = async(req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const user = await userModel.findById(req.user._id);
        const compare = bcrypt.compareSync(password, user.password);
        if (compare) {
            if (user._id == id || user.role == 'Admin') {
                const deletedUser = await userModel.updateOne({_id: id}, {isDeleted: true});
                deletedUser.modifiedCount? res.status(200).json({message: "Done"}) : res.status(400).json({message: "Fail to delete account"})
            }else
            {
                res.status(400).json({message: "Fail to delete account"})
            }
        } else {
            res.status(401).json({message: "Invalid password"});
        }
    } catch (error) {
        res.status(400).json({message: "catch error", error})
    }
}

export const addProfilePic = async(req,res) => {
    try {
        if(!req.file || req.file.size >159500 )
        {
            res.status(400).json({message: "please upload an image"});
        }
        else
        {
            const { secure_url } = await cloudinary.uploader.upload(req.file.path,{folder:`User/${req.user._id}/profilePic`});
            const user = await userModel.findByIdAndUpdate(req.user._id, {profilePic: secure_url});
            res.status(200).json({message:"Done"});
        }
    } catch (error) {
        res.status(400).json({message: "catch error"})
    }
}

export const addCoverPic = async(req,res) => {
    try {
        if(!req.files || req.files.length == 1)
        {
            res.status(400).json({message: "please upload more than one image"});
        }
        else
        {
            const images = [];
            for (const file of req.files) {
                const { secure_url } = await cloudinary.uploader.upload(file.path,{folder:`User/${req.user._id}/coverPics`});
                images.push(secure_url);
            }
            const user = await userModel.findByIdAndUpdate(req.user._id, {coverPic: images});
            res.status(200).json({message:"Done"});
        }
    } catch (error) {
        res.status(400).json({message: "catch error"})
    }
}

export const blockUser = async(req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
            if (user.role != 'Admin') {
                const deletedUser = await userModel.updateOne({_id: id}, {isDeleted: true});
                deletedUser.modifiedCount? res.status(200).json({message: "Done"}) : res.status(400).json({message: "Fail to delete account"})
            }else
            {
                res.status(400).json({message: "Can't block admin"})
            }
        } catch (error) {
        res.status(400).json({message: "catch error"});
    }
}

let Users = [];
export const dailyMessage = async(req, res) => {
    try {
        if(Users.length == 0)
        {
            Users = await userModel.find({age:{$gte: 20}, role: {$ne: "Admin"}}).select('email');
        }
        const attach = {
            filename: 'text.pdf',
            content: 'hello world!',
            contentType: 'text/pdf'
        }
        for (const user of Users) {
            await sendEmail(user.email, 'Daily Message', `<p> Hello my friend </p>`, attach)
        }

    } catch (error) {
        res.status(400).json({message: "catch error", error})
    }
}

export const getUsers = async(req, res) => {
    try {
        // prepare ur posts first model
        const postList = [];
        const cursor = postModel.find({}).cursor();
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            const comments = await commentModel.find({postId: doc._id}).populate([
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
                }]);
            const newDoc = doc.toObject();
            newDoc.comments = comments;
            postList.push(newDoc);
        }

        //now for user
        const { page, size } = req.query;
        const { limit, skip } = paginate(page, size);
        const userList = await userModel.find({}).limit(limit).skip(skip).select('userName profilePic coverPic email');
        const newUserList = [];
        userList.forEach(user => {
            console.log(user);
            const newUser = user.toObject();
            newUser.posts = [];
            for (let index = 0; index < postList.length; index++) {
                if(JSON.stringify(postList[index].userId) == JSON.stringify(user._id))
                {
                    console.log(postList[index]);
                    newUser.posts.push(postList[index]);
                    postList.splice(index,1);
                }
            }
            newUserList.push(newUser)
        });
        res.status(200).json({message: "Done", newUserList})
    } catch (error) {
        res.status(400).json({message: "catch error"})
    }
}