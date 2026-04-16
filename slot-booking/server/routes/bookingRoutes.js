const router = require("express").Router();
const User = require('../models/user')
const Booking = require("../models/booking");
const Meeting = require("../models/meeting");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");
const { bookSlot } = require("../controllers/bookingController");
const auth = require("../middleware/auth");

// Book Slot
router.post("/book", bookSlot);

router.get("/myBookings", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  let bookings = await Booking.find({
    $or: [
      { user: req.user.id },              // logged-in bookings
      { "guest.email": user.email }       // guest bookings
    ]
  }).populate("meeting");

  await Booking.updateMany(
    { "guest.email": user.email, user: null },
    { $set: { user: user._id } }
  );

  bookings = bookings.map(b => {
    const slot = b.meeting?.slots.find(
      s => s.slotId === b.slotId
    );

    return {
      ...b.toObject(),
      slot
    };
  });

  res.json(bookings);
});

//-----Rescheduling can be done by host only-----
// router.post("/reschedule", auth, async (req, res) => {
//   const { bookingId, newSlotId } = req.body;

//   const booking = await Booking.findById(bookingId).populate("meeting");
//   if (!booking) return res.status(404).json({ message: "Booking not found" });

//   const meeting = await Meeting.findById(booking.meeting._id).populate(
//     "host",
//     "name email"
//   );
//   if (!meeting) return res.status(404).json({ message: "Meeting not found" });

//   if (meeting.host._id.toString() !== req.user.id) {
//     return res.status(403).json({ message: "Only host can reschedule" });
//   }

//   const oldSlot = meeting.slots.find((slot) => slot.slotId === booking.slotId);
//   const newSlot = meeting.slots.find((slot) => slot.slotId === newSlotId);
//   if (newSlot) return res.status(404).json({ message: "Slot already exists" });
//   if (newSlot.isBooked) return res.status(400).json("New slot is already booked");

//   if (oldSlot) oldSlot.isBooked = false;
//   newSlot.isBooked = true;
//   booking.slotId = newSlotId;
//   booking.meetLink = newSlot.meetLink;

//   await meeting.save();
//   await booking.save();

//   await sendEmail({
//     from: `"Slot Booking Team" <${process.env.EMAIL}>`,
//     to: booking.guest.email,
//     ...emailTemplates.bookingRescheduleGuest(
//       booking.guest,
//       meeting,
//       oldSlot,
//       newSlot
//     )
//   });

//   if (meeting.host?.email) {
//     await sendEmail({
//       from: `"Slot Booking Team" <${process.env.EMAIL}>`,
//       to: meeting.host.email,
//       ...emailTemplates.bookingRescheduleHost(
//         meeting.host,
//         booking.guest,
//         meeting,
//         oldSlot,
//         newSlot
//       )
//     });
//   }

//   res.json({ message: "Booking rescheduled", booking });
// });

router.post("/cancel", auth, async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate("meeting");
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const user = await User.findById(req.user.id);

  if (booking.guest.email !== user.email) {
    return res.status(403).json({ message: "Unauthorized to cancel this booking" });
  }

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