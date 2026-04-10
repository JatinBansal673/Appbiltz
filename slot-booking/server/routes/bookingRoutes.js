const router = require("express").Router();
const Booking = require("../models/booking");
const Meeting = require("../models/meeting");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");

const findSlotByStart = (meeting, slotTime) => {
  const requested = new Date(slotTime);
  return meeting.slots.find(
    (slot) =>
      slot.startTime && slot.startTime.getTime() === requested.getTime()
  );
};

// Book Slot
router.post("/book", async (req, res) => {
  const { meetingId, slotTime, name, email, location, reason } = req.body;

  const meeting = await Meeting.findById(meetingId).populate("host", "name email");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const slot = findSlotByStart(meeting, slotTime);
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  if (slot.isBooked) return res.status(400).json("Already booked");

  slot.isBooked = true;
  await meeting.save();

  const booking = await Booking.create({
    meeting: meeting._id,
    slotStart: slot.startTime,
    guest: { name, email, location, reason }
  });

  await sendEmail({
    from: process.env.EMAIL,
    to: email,
    ...emailTemplates.bookingConfirmationEmail({ name, email }, meeting, slot)
  });

  if (meeting.host?.email) {
    await sendEmail({
      from: process.env.EMAIL,
      to: meeting.host.email,
      ...emailTemplates.bookingNotificationEmail(
        meeting.host,
        { name, email, location, reason },
        meeting,
        slot
      )
    });
  }

  res.status(201).json(booking);
});

router.post("/reschedule", async (req, res) => {
  const { bookingId, newSlotTime } = req.body;

  const booking = await Booking.findById(bookingId).populate("meeting");
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const meeting = await Meeting.findById(booking.meeting._id).populate(
    "host",
    "name email"
  );
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const oldSlot = meeting.slots.find(
    (slot) =>
      slot.startTime && slot.startTime.getTime() === booking.slotStart.getTime()
  );
  const newSlot = findSlotByStart(meeting, newSlotTime);
  if (!newSlot) return res.status(404).json({ message: "New slot not found" });
  if (newSlot.isBooked) return res.status(400).json("New slot is already booked");

  if (oldSlot) oldSlot.isBooked = false;
  newSlot.isBooked = true;
  booking.slotStart = newSlot.startTime;

  await meeting.save();
  await booking.save();

  await sendEmail({
    from: process.env.EMAIL,
    to: booking.guest.email,
    ...emailTemplates.bookingRescheduleGuest(
      booking.guest,
      meeting,
      oldSlot,
      newSlot
    )
  });

  if (meeting.host?.email) {
    await sendEmail({
      from: process.env.EMAIL,
      to: meeting.host.email,
      ...emailTemplates.bookingRescheduleHost(
        meeting.host,
        booking.guest,
        meeting,
        oldSlot,
        newSlot
      )
    });
  }

  res.json({ message: "Booking rescheduled", booking });
});

router.post("/cancel", async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate("meeting");
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const meeting = await Meeting.findById(booking.meeting._id).populate(
    "host",
    "name email"
  );
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const slot = meeting.slots.find(
    (slotItem) =>
      slotItem.startTime &&
      slotItem.startTime.getTime() === booking.slotStart.getTime()
  );

  if (slot) slot.isBooked = false;
  await meeting.save();

  await sendEmail({
    from: process.env.EMAIL,
    to: booking.guest.email,
    ...emailTemplates.bookingCancellationGuest(booking.guest, meeting, slot)
  });

  if (meeting.host?.email) {
    await sendEmail({
      from: process.env.EMAIL,
      to: meeting.host.email,
      ...emailTemplates.bookingCancellationHost(
        meeting.host,
        booking.guest,
        meeting,
        slot
      )
    });
  }

  await Booking.deleteOne({ _id: booking._id });

  res.json({ message: "Booking cancelled" });
});

module.exports = router;