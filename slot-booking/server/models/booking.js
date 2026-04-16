const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
  slotId: { type: String, required: true, unique: true },

  guest: {
    name: String,
    email: String,
    location: String,
    reason: String
  },

  meetLink: String
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);