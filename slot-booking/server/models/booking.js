const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
  slotId: String,

  guest: {
    name: String,
    email: String,
    location: String,
    reason: String
  },

  meetLink: String
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);