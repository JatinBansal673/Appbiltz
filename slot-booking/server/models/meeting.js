const mongoose=require('mongoose')
const { v4: uuidv4 }=require('uuid')

const meetingSchema= new mongoose.Schema({
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    title: String,
    description: String,
    slug: { type: String, default: uuidv4, unique: true },

    duration: Number, // minutes

    timezone: { type: String, default: "Asia/Kolkata" },

    slots: [
        {
        startTime: Date,
        endTime: Date,
        isBooked: { type: Boolean, default: false }
        }
    ]
}, { timestamps: true });