const formatDateTime = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const verificationEmail = (name, token) => {
  const baseUrl = process.env.VITE_APP_BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:4000";
  const verifyUrl = `${baseUrl}/api/v1/auth/verify/${token}`;
  return {
    subject: "Verify your email",
    html: `
      <p>Hi ${name || "there"},</p>
      <p>Thanks for signing up. Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>If the link does not work, paste the following URL into your browser:</p>
      <p>${verifyUrl}</p>
      <p>Welcome aboard,<br/>Slot Booking Team</p>
    `
  };
};

const bookingConfirmationEmail = (guest, meeting, slot) => ({
  subject: `Booking confirmed for ${meeting.title}`,
  html: `
      <p>Hi ${guest.name},</p>
      <p>Your booking for <strong>${meeting.title}</strong> is confirmed.</p>
      <p><strong>When:</strong> ${formatDateTime(slot.startTime)}</p>
      <p><strong>Details:</strong> ${meeting.description || "N/A"}</p>
      <p><strong>Location:</strong> ${guest.location || "Not provided"}</p>
      <p><strong>Meet Link:</strong> ${slot.meetLink}</p>
      <p>We look forward to seeing you.</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const bookingNotificationEmail = (host, guest, meeting, slot) => ({
  subject: `New booking for ${meeting.title}`,
  html: `
      <p>Hi ${host.name || "Host"},</p>
      <p>A new booking has been made for your meeting <strong>${meeting.title}</strong>.</p>
      <p><strong>Guest:</strong> ${guest.name} (${guest.email})</p>
      <p><strong>When:</strong> ${formatDateTime(slot.startTime)}</p>
      <p><strong>Location:</strong> ${guest.location || "Not provided"}</p>
      <p><strong>Reason:</strong> ${guest.reason || "Not provided"}</p>
      <p><strong>Meet Link:</strong> ${slot.meetLink}</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const bookingRescheduleGuest = (guest, meeting, oldSlot, newSlot) => ({
  subject: `Your booking has been rescheduled for ${meeting.title}`,
  html: `
      <p>Hi ${guest.name},</p>
      <p>Your booking for <strong>${meeting.title}</strong> has been rescheduled.</p>
      <p><strong>Previous time:</strong> ${formatDateTime(oldSlot?.startTime)}</p>
      <p><strong>New time:</strong> ${formatDateTime(newSlot.startTime)}</p>
      <p><strong>Meet Link:</strong> ${newSlot.meetLink}</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const bookingRescheduleHost = (host, guest, meeting, oldSlot, newSlot) => ({
  subject: `Booking rescheduled for ${meeting.title}`,
  html: `
      <p>Hi ${host.name || "Host"},</p>
      <p><strong>Previous time:</strong> ${formatDateTime(oldSlot?.startTime)}</p>
      <p><strong>New time:</strong> ${formatDateTime(newSlot.startTime)}</p>
      <p><strong>Meet Link:</strong> ${newSlot.meetLink}</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const bookingCancellationGuest = (guest, meeting, slot) => ({
  subject: `Your booking has been cancelled for ${meeting.title}`,
  html: `
      <p>Hi ${guest.name},</p>
      <p>Your booking for <strong>${meeting.title}</strong> on ${formatDateTime(slot?.startTime)} has been cancelled.</p>
      <p>If you need a new slot, please book again.</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const bookingCancellationHost = (host, guest, meeting, slot) => ({
  subject: `A booking was cancelled for ${meeting.title}`,
  html: `
      <p>Hi ${host.name || "Host"},</p>
      <p>The booking by ${guest.name} (${guest.email}) for <strong>${meeting.title}</strong> on ${formatDateTime(slot?.startTime)} has been cancelled.</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const meetingCancellationGuest = (guest, meeting, slot) => ({
  subject: `Meeting cancelled: ${meeting.title}`,
  html: `
      <p>Hi ${guest.name},</p>
      <p>The meeting <strong>${meeting.title}</strong> scheduled for ${formatDateTime(slot?.startTime)} has been cancelled by the host.</p>
      <p>We apologize for the inconvenience.</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

const meetingCancellationHost = (host, meeting) => ({
  subject: `Your meeting has been cancelled: ${meeting.title}`,
  html: `
      <p>Hi ${host.name || "Host"},</p>
      <p>Your meeting <strong>${meeting.title}</strong> has been cancelled successfully.</p>
      <p>All associated bookings have been removed.</p>
      <p>Thanks,<br/>Slot Booking Team</p>
    `
});

module.exports = {
  verificationEmail,
  bookingConfirmationEmail,
  bookingNotificationEmail,
  bookingRescheduleGuest,
  bookingRescheduleHost,
  bookingCancellationGuest,
  bookingCancellationHost,
  meetingCancellationGuest,
  meetingCancellationHost
};
