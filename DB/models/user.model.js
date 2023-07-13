import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    age: Number,
    phone: String,
    profilePic: String,
    coverPic: Array,
    confirmEmail: {type: Boolean, default: false},
    gender: {type: String, default: 'Male', enum:['Male', 'Female']},
    isDeleted: {type: Boolean, default: false},
    QrCode: String,
    role: {type: String, default: 'User', enum: ['User', 'Admin']}
},{
    timestamps: true
})

export const userModel = mongoose.model('User', userSchema);