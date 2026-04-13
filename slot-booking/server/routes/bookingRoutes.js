const router = require("express").Router();
const Booking = require("../models/booking");
const Meeting = require("../models/meeting");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");
const { bookSlot } = require("../controllers/bookingController");

// Book Slot
router.post("/book", bookSlot);

router.post("/reschedule", async (req, res) => {
  const { bookingId, newSlotId } = req.body;

  const booking = await Booking.findById(bookingId).populate("meeting");
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const meeting = await Meeting.findById(booking.meeting._id).populate(
    "host",
    "name email"
  );
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const oldSlot = meeting.slots.find((slot) => slot.slotId === booking.slotId);
  const newSlot = meeting.slots.find((slot) => slot.slotId === newSlotId);
  if (!newSlot) return res.status(404).json({ message: "New slot not found" });
  if (newSlot.isBooked) return res.status(400).json("New slot is already booked");

  if (oldSlot) oldSlot.isBooked = false;
  newSlot.isBooked = true;
  booking.slotId = newSlotId;
  booking.meetLink = newSlot.meetLink;

  await meeting.save();
  await booking.save();

  await sendEmail({
    from: `"Slot Booking Team" <${process.env.EMAIL}>`,
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
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
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
    (slotItem) => slotItem.slotId === booking.slotId
  );

  if (slot) slot.isBooked = false;
  await meeting.save();

  await sendEmail({
    from: `"Slot Booking Team" <${process.env.EMAIL}>`,
    to: booking.guest.email,
    ...emailTemplates.bookingCancellationGuest(booking.guest, meeting, slot)
  });

  if (meeting.host?.email) {
    await sendEmail({
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
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