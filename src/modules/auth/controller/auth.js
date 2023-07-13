import { userModel } from './../../../../DB/models/user.model.js';
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { sendEmail } from './../../../services/email.js';
import jwt from 'jsonwebtoken'


export const SignUp = async(req, res) => {
    try {
        const { userName, email, password, age, phone, gender } = req.body;
        const user = await userModel.findOne({email}).select(email);
        if (user) {
            res.status(409).json({message: "Email exist!"});
        } else {
            const hashPassword = bcrypt.hashSync(password, parseInt(process.env.SALTROUND));
            const savedUser = await userModel.create({userName, email, password: hashPassword, age, phone, gender});
            res.status(201).json({message: "Done", savedUser})
            const token = jwt.sign({id:savedUser._id}, process.env.EMAILTOKEN, {expiresIn:'1h'});
            const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
            await sendEmail(email, 'Email Confirmation', `<a href = ${link}> Please follow me to confirm ur email </a>`);
            // QRCode.toDataURL(email, async function (err, url) {
            // })
        }
    } catch (error) {
        res.status(400).json({message: "catch error", error});
        console.log(error);
    }
}

export const confirmEmail = async(req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.EMAILTOKEN);
        if(!decoded?.id)
        {
            res.status(400).json({message: "Invalid token"});
        }
        else
        {
            const user = await userModel.findOneAndUpdate({_id:decoded.id, confirmEmail: false}, {confirmEmail: true});
            if (user) {
                res.status(200).json({message:"Ur account is confirmed plz proceed to login page"});
            } else {
                res.status(400).json({message: "Already confirmed!"});
            }
        }
    } catch (error) {
        res.status(400).json({message: "catch error", error})
    }
}

export const SignIn = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({email});
        if (!user) {
            res.status(400).json({message: "Email not exist"});
        } else {
            console.log(user.confirmEmail);
            if (user.confirmEmail) {
                const compare = bcrypt.compareSync(password, user.password);
                if (!compare) {
                    res.status(400).json({message: "Password isnt valid"})
                } else {
                    const token = jwt.sign({id: user._id}, process.env.EMAILTOKEN, {expiresIn:'1h'});
                    res.status(200).json({message: "Done", token});
                }
            } else {
                res.status(400).json({message: "U need to confirm ur email first"});
            }
        }
    } catch (error) {
        res.status(400).json({message: "catch error", error});
    }
}


