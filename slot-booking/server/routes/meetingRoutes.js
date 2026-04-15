const router = require("express").Router();
const auth = require("../middleware/auth");
const Meeting = require("../models/meeting");
const Booking = require("../models/booking");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");
const { createMeeting, getSlot } = require("../controllers/meetingController");
const { deleteMeetEvent, createMeetLink, updateMeetEvent } = require("../services/googleMeetService");
const { v4: uuidv4 } = require("uuid");

// Create Meeting
router.post("/create", auth, createMeeting);

// Get meetings for current user
router.get("/user", auth, async (req, res) => {
  const meetings = await Meeting.find({ host: req.user.id });
  if(!meetings) return res.status(200).json({message: "No Data Found"});
  return res.json(meetings);
});

// Get Available Meeting Slots by ID (Public)
router.get("/:id", async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const availableSlots = meeting.slots.filter(s => !s.isBooked);

  res.json({
    meetingId: meeting._id,
    title: meeting.title,
    slots: availableSlots
  });
});

// Cancel meeting and notify guests
router.post("/cancel/:id", auth, async (req, res) => {
  const meeting = await Meeting.findById(req.params.id).populate("host", "name email googleRefreshToken");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  if (meeting.host._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "Only the meeting host can cancel this meeting" });
  }

  const bookings = await Booking.find({ meeting: meeting._id });
  const hostEmail = meeting.host.email;

  for (const booking of bookings) {
    const bookedSlot = meeting.slots.find(
      (slot) => slot.slotId === booking.slotId
    );

    await sendEmail({
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
      to: booking.guest.email,
      ...emailTemplates.meetingCancellationGuest(booking.guest, meeting, bookedSlot)
    });
  }

  if (hostEmail) {
    await sendEmail({
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
      to: hostEmail,
      ...emailTemplates.meetingCancellationHost(meeting.host, meeting)
    });
  }

  for (const slot of meeting.slots) {
    if (slot.eventId) {
      await deleteMeetEvent(slot.eventId, meeting.host.googleRefreshToken);
    }
  }

  await Booking.deleteMany({ meeting: meeting._id });
  await Meeting.deleteOne({ _id: meeting._id });

  res.json({ message: "Meeting cancelled and all bookings removed" });
});

// Add slot to an existing meeting
router.post("/slot/add/:meetingId", auth, async (req, res) => {
  const { startTime, endTime } = req.body;

  const meeting = await Meeting.findById(req.params.meetingId).populate("host", "googleRefreshToken");

  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  // Only host can add slot
  if (meeting.host._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!meeting.host.googleRefreshToken) {
    return res.status(400).json({ message: "Host must connect Google before adding slots." });
  }

  try {
    const { meetLink, eventId } = await createMeetLink(
      startTime,
      endTime,
      meeting.title,
      meeting.host.googleRefreshToken
    );

    const newSlot = {
      slotId: uuidv4(),
      startTime,
      endTime,
      meetLink,
      eventId,
      isBooked: false
    };

    meeting.slots.push(newSlot);
    await meeting.save();

    res.json({
      message: "Slot added successfully",
      slot: newSlot,
      slotLink: meetLink
    });

  } catch (err) {
    console.error(err);
    res.status(500).json("Error adding slot");
  }
});

// Get slots
router.get("/slot/:slotId", getSlot);

//Reschedule slot
router.post("/slot/reschedule/:slotId", auth, async (req, res) => {
  const { startTime, endTime } = req.body;

  const meeting = await Meeting.findOne({ "slots.slotId": req.params.slotId })
    .populate("host", "googleRefreshToken email");

  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found" });
  }

  if (meeting.host._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const slot = meeting.slots.find(s => s.slotId === req.params.slotId);
  if (!slot) {
    return res.status(404).json({ message: "Slot not found" });
  }

  try {
    if (slot.eventId) {
      await updateMeetEvent(
        slot.eventId,
        startTime,
        endTime,
        meeting.title,
        meeting.host.googleRefreshToken
      );
    }
    slot.startTime = startTime;
    slot.endTime = endTime;

    await meeting.save();
    
    const bookings = await Booking.find({
      meeting: meeting._id,
      slotId: slot.slotId
    });

    for (const booking of bookings) {
      await sendEmail({
        from: `"Slot Booking Team" <${process.env.EMAIL}>`,
        to: booking.guest.email,
        ...emailTemplates.bookingRescheduleGuest(
          booking.guest,
          meeting,
          slot
        )
      });
    }

    res.json({
      message: "Slot rescheduled successfully",
      slot
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rescheduling slot" });
  }
});

//delete the slot
router.post("/slot/cancel/:slotId", auth, async (req, res) => {
  const meeting = await Meeting.findOne({ "slots.slotId": req.params.slotId }).populate(
    "host",
    "name email googleRefreshToken"
  );

  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  if (meeting.host._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "Only the meeting host can cancel a slot" });
  }

  const slot = meeting.slots.find((slotItem) => slotItem.slotId === req.params.slotId);
  if (!slot) return res.status(404).json({ message: "Slot not found" });

  const bookings = await Booking.find({ meeting: meeting._id, slotId: slot.slotId });

  for (const booking of bookings) {
    await sendEmail({
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
      to: booking.guest.email,
      ...emailTemplates.bookingCancellationGuest(booking.guest, meeting, slot)
    });
  }

  if (meeting.host?.email && bookings.length > 0) {
    await sendEmail({
      from: `"Slot Booking Team" <${process.env.EMAIL}>`,
      to: meeting.host.email,
      ...emailTemplates.bookingCancellationHost(meeting.host, { name: bookings[0].guest.name, email: bookings[0].guest.email }, meeting, slot)
    });
  }

  await Booking.deleteMany({ meeting: meeting._id, slotId: slot.slotId });
  if (slot.eventId) {
    await deleteMeetEvent(slot.eventId, meeting.host.googleRefreshToken);
  }

  meeting.slots = meeting.slots.filter((slotItem) => slotItem.slotId !== slot.slotId);
  await meeting.save();

  res.json({ message: "Slot cancelled and removed from meeting" });
});

module.exports = router;