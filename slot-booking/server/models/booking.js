const mongoose=require('mongoose')

const bookingSchema= new mongoose.Schema({
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", index: true },
    slotStart: Date,

    guest: {
        name: String,
        email: String,
        location: String,
        reason: String
    }
}, { timestamps: true });

bookingSchema.index({ meeting: 1, slotStart: 1 }, { unique: true });
    
module.exports = mongoose.model("Booking", bookingSchema);