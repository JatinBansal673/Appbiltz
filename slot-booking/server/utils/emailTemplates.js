const formatDateTime = (value) => {
  const date = value instanceof Date ? value : new Date(value).toLocaleString();
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

/* ---------- Shared design system ---------- */
const COLORS = {
  brand: "#2563EB",
  brandDark: "#1D4ED8",
  brandSoft: "#EFF6FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F1F5F9",
  card: "#FFFFFF"
};

const wrap = ({ preheader = "", accent = COLORS.brand, badge = "", title, intro = "", bodyHtml = "", ctaText = "", ctaUrl = "", footerNote = "" }) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${COLORS.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${COLORS.card};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);border:1px solid ${COLORS.border};">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg, ${accent} 0%, ${COLORS.brandDark} 100%);padding:28px 32px;">
          <table width="100%"><tr>
            <td style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.01em;">Meetify</td>
            <td align="right" style="color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;">${badge}</td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 32px 16px;">
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:700;color:${COLORS.text};letter-spacing:-0.02em;">${title}</h1>
          ${intro ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${COLORS.muted};">${intro}</p>` : ""}
          ${bodyHtml}
          ${ctaText && ctaUrl ? `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
            <tr><td style="border-radius:10px;background:${accent};">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;border-radius:10px;">${ctaText}</a>
            </td></tr>
          </table>` : ""}
        </td></tr>

        ${footerNote ? `<tr><td style="padding:0 32px 24px;"><p style="margin:0;font-size:13px;color:${COLORS.muted};line-height:1.5;">${footerNote}</p></td></tr>` : ""}

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid ${COLORS.border};background:#FAFBFC;">
          <p style="margin:0 0 4px;font-size:13px;color:${COLORS.text};font-weight:600;">Slot Booking Team</p>
          <p style="margin:0;font-size:12px;color:${COLORS.muted};">Effortless scheduling, beautifully simple.</p>
        </td></tr>

      </table>
      <p style="margin:16px 0 0;font-size:11px;color:${COLORS.muted};">© ${new Date().getFullYear()} Slot Booking. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>
`;

const detailRow = (label, value, accent = COLORS.brand) => `
  <tr>
    <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:13px;color:${COLORS.muted};font-weight:500;text-transform:uppercase;letter-spacing:0.04em;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:14px 18px;border-bottom:1px solid ${COLORS.border};font-size:14px;color:${COLORS.text};font-weight:500;line-height:1.5;">${value}</td>
  </tr>`;

const detailsCard = (rows, accent = COLORS.brand) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;background:${COLORS.brandSoft};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;border-left:4px solid ${accent};">
    ${rows.map((r, i) => `<tr><td style="padding:14px 18px;${i < rows.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ""}font-size:13px;color:${COLORS.muted};font-weight:500;text-transform:uppercase;letter-spacing:0.04em;width:140px;vertical-align:top;">${r.label}</td>
    <td style="padding:14px 18px;${i < rows.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ""}font-size:14px;color:${COLORS.text};font-weight:500;line-height:1.5;">${r.value}</td></tr>`).join("")}
  </table>`;

const meetLinkBtn = (url) => url ? `<a href="${url}" style="color:${COLORS.brand};text-decoration:none;font-weight:600;">🔗 Join Meeting</a>` : "Not available";

/* ---------- Templates ---------- */

const verificationEmail = (name, token) => {
  const baseUrl = process.env.VITE_APP_BACKEND_URL;
  const verifyUrl = `${baseUrl}/api/v1/auth/verify/${token}`;
  return {
    subject: "Verify your email",
    html: wrap({
      preheader: "Confirm your email to activate your Slot Booking account.",
      badge: "Account · Verification",
      title: `Welcome${name ? `, ${name}` : ""} 👋`,
      intro: "Thanks for signing up! Please verify your email address to activate your account and start scheduling meetings.",
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:14px;color:${COLORS.muted};">Click the button below to confirm your email:</p>`,
      ctaText: "Verify My Email",
      ctaUrl: verifyUrl,
      footerNote: `If the button doesn't work, copy and paste this link into your browser:<br/><a href="${verifyUrl}" style="color:${COLORS.brand};word-break:break-all;">${verifyUrl}</a><br/><br/>If you didn't create an account, you can safely ignore this email.`
    })
  };
};

const bookingConfirmationEmail = (guest, meeting, slot) => ({
  subject: `Booking confirmed for ${meeting.title}`,
  html: wrap({
    preheader: `Your booking for ${meeting.title} is confirmed.`,
    accent: COLORS.success,
    badge: "✓ Booking Confirmed",
    title: `You're all set, ${guest.name}!`,
    intro: `Your booking for <strong style="color:${COLORS.text};">${meeting.title}</strong> has been confirmed. Here are the details:`,
    bodyHtml: detailsCard([
      { label: "When", value: formatDateTime(slot.startTime) },
      { label: "Details", value: meeting.description || "N/A" },
      { label: "Location", value: guest.location || "Not provided" },
      { label: "Meet Link", value: meetLinkBtn(slot.meetLink) }
    ], COLORS.success),
    ctaText: slot.meetLink ? "Join the Meeting" : "",
    ctaUrl: slot.meetLink || "",
    footerNote: "We look forward to seeing you. Add this to your calendar so you don't miss it!"
  })
});

const bookingNotificationEmail = (host, guest, meeting, slot) => ({
  subject: `New booking for ${meeting.title}`,
  html: wrap({
    preheader: `${guest.name} just booked ${meeting.title}.`,
    badge: "🔔 New Booking",
    title: `New booking received`,
    intro: `Hi ${host.name || "Host"}, a new booking has been made for your meeting <strong style="color:${COLORS.text};">${meeting.title}</strong>.`,
    bodyHtml: detailsCard([
      { label: "Guest", value: `${guest.name} <span style="color:${COLORS.muted};">(${guest.email})</span>` },
      { label: "When", value: formatDateTime(slot.startTime) },
      { label: "Location", value: guest.location || "Not provided" },
      { label: "Reason", value: guest.reason || "Not provided" },
      { label: "Meet Link", value: meetLinkBtn(slot.meetLink) }
    ]),
    ctaText: slot.meetLink ? "Open Meeting Link" : "",
    ctaUrl: slot.meetLink || ""
  })
});

const bookingRescheduleGuest = (guest, meeting, oldSlot, newSlot) => ({
  subject: `Your booking has been rescheduled for ${meeting.title}`,
  html: wrap({
    preheader: `New time for ${meeting.title}: ${formatDateTime(newSlot.startTime)}`,
    accent: COLORS.warning,
    badge: "🔄 Rescheduled",
    title: `Your booking has been rescheduled`,
    intro: `Hi ${guest.name}, the time for <strong style="color:${COLORS.text};">${meeting.title}</strong> has changed. Please review the updated details below.`,
    bodyHtml: detailsCard([
      { label: "Previous", value: `<span style="text-decoration:line-through;color:${COLORS.muted};">${formatDateTime(oldSlot?.startTime)}</span>` },
      { label: "New Time", value: `<strong style="color:${COLORS.success};">${formatDateTime(newSlot.startTime)}</strong>` },
      { label: "Meet Link", value: meetLinkBtn(newSlot.meetLink) }
    ], COLORS.warning),
    ctaText: newSlot.meetLink ? "Join at New Time" : "",
    ctaUrl: newSlot.meetLink || "",
    footerNote: "Please update your calendar accordingly."
  })
});

const bookingRescheduleHost = (host, guest, meeting, oldSlot, newSlot) => ({
  subject: `Booking rescheduled for ${meeting.title}`,
  html: wrap({
    preheader: `Booking rescheduled to ${formatDateTime(newSlot.startTime)}`,
    accent: COLORS.warning,
    badge: "🔄 Rescheduled",
    title: `A booking has been rescheduled`,
    intro: `Hi ${host.name || "Host"}, the booking for <strong style="color:${COLORS.text};">${meeting.title}</strong> has been moved to a new time.`,
    bodyHtml: detailsCard([
      { label: "Previous", value: `<span style="text-decoration:line-through;color:${COLORS.muted};">${formatDateTime(oldSlot?.startTime)}</span>` },
      { label: "New Time", value: `<strong style="color:${COLORS.success};">${formatDateTime(newSlot.startTime)}</strong>` },
      { label: "Meet Link", value: meetLinkBtn(newSlot.meetLink) }
    ], COLORS.warning),
    ctaText: newSlot.meetLink ? "Open Meeting Link" : "",
    ctaUrl: newSlot.meetLink || ""
  })
});

const bookingCancellationGuest = (guest, meeting, slot) => ({
  subject: `Your booking has been cancelled for ${meeting.title}`,
  html: wrap({
    preheader: `Your booking for ${meeting.title} was cancelled.`,
    accent: COLORS.danger,
    badge: "✕ Cancelled",
    title: `Booking cancelled`,
    intro: `Hi ${guest.name}, your booking for <strong style="color:${COLORS.text};">${meeting.title}</strong> has been cancelled.`,
    bodyHtml: detailsCard([
      { label: "Meeting", value: meeting.title },
      { label: "Was Scheduled", value: formatDateTime(slot?.startTime) }
    ], COLORS.danger),
    footerNote: "If this was a mistake or you'd like to reschedule, please book a new slot at your convenience."
  })
});

const bookingCancellationHost = (host, guest, meeting, slot) => ({
  subject: `A booking was cancelled for ${meeting.title}`,
  html: wrap({
    preheader: `${guest.name} cancelled their booking.`,
    accent: COLORS.danger,
    badge: "✕ Booking Cancelled",
    title: `A booking was cancelled`,
    intro: `Hi ${host.name || "Host"}, the following booking has been cancelled.`,
    bodyHtml: detailsCard([
      { label: "Meeting", value: meeting.title },
      { label: "Guest", value: `${guest.name} <span style="color:${COLORS.muted};">(${guest.email})</span>` },
      { label: "Was Scheduled", value: formatDateTime(slot?.startTime) }
    ], COLORS.danger)
  })
});

const meetingCancellationGuest = (guest, meeting, slot) => ({
  subject: `Meeting cancelled: ${meeting.title}`,
  html: wrap({
    preheader: `${meeting.title} has been cancelled by the host.`,
    accent: COLORS.danger,
    badge: "✕ Meeting Cancelled",
    title: `Meeting cancelled`,
    intro: `Hi ${guest.name}, unfortunately the meeting <strong style="color:${COLORS.text};">${meeting.title}</strong> scheduled for ${formatDateTime(slot?.startTime)} has been cancelled by the host.`,
    bodyHtml: `<div style="padding:16px 18px;background:#FEF2F2;border-left:4px solid ${COLORS.danger};border-radius:8px;font-size:14px;color:${COLORS.text};line-height:1.5;">We sincerely apologize for any inconvenience this may cause.</div>`,
    footerNote: "Feel free to book another available slot when convenient."
  })
});

const meetingCancellationHost = (host, meeting) => ({
  subject: `Your meeting has been cancelled: ${meeting.title}`,
  html: wrap({
    preheader: `${meeting.title} has been removed.`,
    accent: COLORS.danger,
    badge: "✕ Meeting Removed",
    title: `Meeting cancelled successfully`,
    intro: `Hi ${host.name || "Host"}, your meeting <strong style="color:${COLORS.text};">${meeting.title}</strong> has been cancelled.`,
    bodyHtml: `<div style="padding:16px 18px;background:${COLORS.brandSoft};border-left:4px solid ${COLORS.brand};border-radius:8px;font-size:14px;color:${COLORS.text};line-height:1.5;">All associated bookings have been removed and guests have been notified automatically.</div>`
  })
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
