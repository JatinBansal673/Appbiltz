const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const slotSchema = new mongoose.Schema({
  slotId: { type: String, default: uuidv4 },
  startTime: Date,
  endTime: Date,
  meetLink: String,
  eventId: String,
  isBooked: { type: Boolean, default: false }
});

const meetingSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  slots: [slotSchema]
}, { timestamps: true });

module.exports = mongoose.model("Meeting", meetingSchema);