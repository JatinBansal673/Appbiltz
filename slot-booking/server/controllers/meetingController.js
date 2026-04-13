const Meeting = require("../models/meeting");
const User = require("../models/user");
const { createMeetLink } = require("../services/googleMeetService");
const { v4: uuidv4 } = require("uuid");

exports.createMeeting = async (req, res) => {
  const { title, description, slots } = req.body;

  if (!title || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ message: "Title and slots are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.googleRefreshToken) {
      return res.status(400).json({ message: "Please connect your Google account before creating meetings." });
    }

    const processedSlots = await Promise.all(
      slots.map(async (slot) => {
        const { eventId, meetLink } = await createMeetLink(
          slot.startTime,
          slot.endTime,
          title,
          user.googleRefreshToken
        );

        return {
          slotId: uuidv4(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          meetLink,
          eventId,
          isBooked: false
        };
      })
    );

    const meeting = await Meeting.create({
      title,
      description,
      host: req.user.id,
      slots: processedSlots
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: error.message || "Failed to create meeting" });
  }
};

exports.getSlot = async (req, res) => {
  const meeting = await Meeting.findOne({
    "slots.slotId": req.params.slotId
  });

  if (!meeting) return res.status(404).json("Slot not found");

  const slot = meeting.slots.find(
    s => s.slotId === req.params.slotId
  );

  res.json({
    title: meeting.title,
    slot
  });
};