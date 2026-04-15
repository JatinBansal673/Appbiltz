const { google } = require("googleapis");

const createCalendarClient = (refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI || "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client
  });
};

exports.createMeetLink = async (start, end, title, refreshToken) => {
  if (!refreshToken) {
    throw new Error("Google refresh token is required to create a meet link for the meeting creator.");
  }

  const calendar = createCalendarClient(refreshToken);

  const event = {
    summary: title,
    start: {
      dateTime: new Date(start).toISOString(),
      timeZone: "Asia/Kolkata"
    },
    end: {
      dateTime: new Date(end).toISOString(),
      timeZone: "Asia/Kolkata"
    },
    conferenceData: {
      createRequest: {
        requestId: "meet-" + Date.now()
      }
    }
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1
  });

  return {
    eventId: res.data.id,
    meetLink: res.data.conferenceData.entryPoints[0].uri
  };
};

exports.deleteMeetEvent = async (eventId, refreshToken) => {
  if (!eventId || !refreshToken) return;

  try {
    const calendar = createCalendarClient(refreshToken);
    await calendar.events.delete({
      calendarId: "primary",
      eventId
    });
  } catch (error) {
    console.warn("Failed to delete Google Meet event:", error.message || error);
  }
};

exports.updateMeetEvent = async (eventId, startTime, endTime, title, refreshToken) => {

  try {
    const calendar = createCalendarClient(refreshToken);
    await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: {
        summary: title,
        start: {
          dateTime: new Date(startTime).toISOString()
        },
        end: {
          dateTime: new Date(endTime).toISOString()
        }
      }
    });
  }catch(err) {
    console.warn("Failed to update Google Meet event:", err.message || err);
  }
};