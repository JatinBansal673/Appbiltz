const router = require("express").Router();
const auth = require("../middleware/auth");
const Meeting = require("../models/meeting");
const Booking = require("../models/booking");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");

// Create Meeting
router.post("/create", auth, async (req, res) => {
  const { title, description, slots } = req.body;

  const meeting = await Meeting.create({
    title,
    description,
    slots,
    host: req.user.id
  });

  res.status(201).json(meeting);
});

// Get Meeting by ID (Public)
router.get("/:id", async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  res.json(meeting);
});

// Cancel meeting and notify guests
router.post("/:id/cancel", auth, async (req, res) => {
  const meeting = await Meeting.findById(req.params.id).populate("host", "name email");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  if (meeting.host._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "Only the meeting host can cancel this meeting" });
  }

  const bookings = await Booking.find({ meeting: meeting._id });
  const hostEmail = meeting.host.email;

  for (const booking of bookings) {
    await sendEmail({
      from: process.env.EMAIL,
      to: booking.guest.email,
      ...emailTemplates.meetingCancellationGuest(booking.guest, meeting, {
        startTime: booking.slotStart
      })
    });
  }

  if (hostEmail) {
    await sendEmail({
      from: process.env.EMAIL,
      to: hostEmail,
      ...emailTemplates.meetingCancellationHost(meeting.host, meeting)
    });
  }

  await Booking.deleteMany({ meeting: meeting._id });
  await Meeting.deleteOne({ _id: meeting._id });

  res.json({ message: "Meeting cancelled and all bookings removed" });
});

module.exports = router;