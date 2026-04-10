const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, unique: true, index: true},
    password: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String

}, {timestamps:true});

module.exports = mongoose.model("User", userSchema);