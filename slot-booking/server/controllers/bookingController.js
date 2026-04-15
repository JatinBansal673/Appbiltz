const Booking = require("../models/booking");
const Meeting = require("../models/meeting");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");

exports.bookSlot = async (req, res) => {
  const { slotId, guest } = req.body;

  if (!slotId || !guest || !guest.name || !guest.email) {
    return res.status(400).json({ message: "slotId, guest.name, and guest.email are required" });
  }

  try {
    const meeting = await Meeting.findOneAndUpdate(
      { "slots.slotId": slotId, "slots.isBooked": false },
      { $set: { "slots.$.isBooked": true } },
      { new: true }
    ).populate("host", "name email");

    if (!meeting) {
      return res.status(400).json({ message: "Slot not found or already booked" });
    }

    const slot = meeting.slots.find((s) => s.slotId === slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found after update" });
    }

    const booking = await Booking.create({
      meeting: meeting._id,
      slotId,
      guest,
      meetLink: slot.meetLink,
      user: null
    });

    await sendEmail({
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
      to: guest.email,
      ...emailTemplates.bookingConfirmationEmail(guest, meeting, slot)
    });

    if (meeting.host?.email) {
      await sendEmail({
        from: `"Slot Booking Team" <${process.env.EMAIL}>`,
        to: meeting.host.email,
        ...emailTemplates.bookingNotificationEmail(meeting.host, guest, meeting, slot)
      });
    }

    res.status(201).json({
      message: "Booked successfully",
      booking,
      meetLink: slot.meetLink
    });

  } catch (err) {
    console.error("Booking failed:", err);
    res.status(500).json({ message: err.message || "Booking failed" });
  }
};