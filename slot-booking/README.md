# 🚀 Slot Booking & Meeting Scheduler Platform

A modern full-stack meeting scheduling platform where hosts can create meetings with multiple time slots, attendees can book available slots without login, and both parties receive automated email notifications, Google Meet links, and calendar reminders.

---

# ✨ Features

## 🔐 Authentication
- Email & Password Authentication
- Google OAuth Login
- JWT-based Authentication
- Protected Routes
- Email Verification

---

## 📅 Host Features
- Create meetings with title & description
- Add multiple slots
- Reschedule slots
- Delete slots
- Cancel meetings
- Google Meet integration
- Google Calendar integration
- View all bookings
- View booked/available status
- Share public booking link
- Receive booking notifications via email
- Automatic calendar event updates

---

## 👥 Attendee Features
- Book meetings without login
- Select from available slots
- Add:
  - Name
  - Email
  - Location
  - Reason for meeting
- Receive:
  - Confirmation email
  - Google Meet link
  - Calendar invitation
  - Automatic reminders from Google Calendar
- Login required only for cancellation

---

## 📧 Email Notifications
Automated emails for:
- Booking confirmation
- Booking cancellation
- Meeting cancellation
- Slot rescheduling
- Host notifications
- Calendar reminders (via Google Calendar)

---

## 🔄 Smart Scheduling
- Real-time slot availability
- Prevents double booking
- Google Meet event auto-updates
- Attendee added directly to calendar event
- Automatic reminder emails from Google Calendar

---

# 🛠️ Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## APIs & Services
- Google OAuth 2.0
- Google Calendar API
- Google Meet API
- Nodemailer

---

# 📁 Project Structure

```bash
slot-booking/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│
├── server/
|   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
```

---

# ⚙️ Setup Instructions

# 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd slot-booking
```

---

# 2️⃣ Install Dependencies

```bash
npm install
```

---

# 3️⃣ Configure Environment Variables

Create a `.env` file inside `slot-booking/`

```env
VITE_APP_FRONTEND_URL=http://localhost:5173
VITE_APP_BACKEND_URL=http://localhost:4000
PORT=4000
DB_URL=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_ID=google_client_id
CLIENT_SECRET=google_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/api/v1/auth/google/callback
REFRESH_TOKEN=google_refresh_token
EMAIL=your_email@gmail.com
```

---

# 4️⃣  Google OAuth Setup (Generate Refresh Token)


# 🚀 Step 1: Create a Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click the **Project Dropdown** (top navbar)
3. Click **New Project**
4. Enter a **Project Name**
5. Click **Create**

---

# ⚙️ Step 2: Configure OAuth Consent Screen

1. Navigate to:

APIs & Services → OAuth consent screen

2. Select:
- **External**
3. Click **Create**

### Fill Required Fields:
- App Name
- User Support Email
- Developer Contact Email

Click **Save and Continue** through all steps (Scopes & Summary)

### ⚠️ Important:
In **Test Users Section**:
- Add your **Google email**

👉 Required to test the app while it's in development mode

---

# 🔑 Step 3: Generate OAuth Client ID & Secret

1. Go to:
         APIs & Services → Credentials
2. Click:
        Create Credentials → OAuth Client ID
3. Select:
       - Application Type: **Web Application**

4. Add Authorized Redirect URI:

```bash
https://developers.google.com/oauthplayground
http://localhost:4000/api/v1/auth/google/callback
```

5. Click **Create**

### 📌 Save these:
- Client ID
- Client Secret

---

# 🔌 Step 4: Enable Required APIs

Go to:

APIs & Services → Library


Enable the following:

### 📧 Gmail API
- Required for sending emails

### 📅 Google Calendar API
- Required for:
  - Creating events
  - Adding attendees
  - Sending reminders

---

# 🧪 Step 5: Open OAuth 2.0 Playground

Go to:
```bash
https://developers.google.com/oauthplayground
```
---

# ⚙️ Step 6: Configure OAuth Playground

1. Click the ⚙️ **Settings Icon (top right)**
2. Enable:
   - ✅ Use your own OAuth credentials

3. Enter:
   - **OAuth Client ID**
   - **OAuth Client Secret**

4. Set:
   - Access Type → **Offline** ✅ (VERY IMPORTANT for refresh token)

5. Click **Close**

---

# 🔐 Step 7: Authorize APIs

In **Step 1: Select & authorize APIs**

Add the following scopes:

### Gmail Scope

https://www.googleapis.com/auth/gmail.send **or** Gmail API v1 -> https://mail.google.com


### Calendar Scope

https://www.googleapis.com/auth/calendar **or** Google Calender API v3 -> https://www.googleapis.com/auth/calendar 


Click:

Authorize APIs


👉 Login with your Google account  
👉 Click **Allow** to grant permissions

---

# 🔁 Step 8: Generate Refresh Token

After authorization:

1. You will be redirected back to OAuth Playground
2. In **Step 2: Exchange authorization code for tokens**
   - Authorization code will be auto-filled

3. Click:

Exchange authorization code for tokens


---

# 🎉 Step 9: Copy Tokens

You will now see:

- ✅ Access Token
- ✅ Refresh Token (IMPORTANT)

### 📌 Save Refresh Token securely
---

# ✅ You're Done!

You now have:
- Google OAuth Credentials
- Enabled APIs
- Refresh Token

Ready to integrate Google services into your application 🚀

---

# 5️⃣ Start App

```bash
npm run dev
```

---

# 🌐 Main Application Flow

## 👨‍💻 Host Flow

1. Signup/Login
2. Connect Google Account
3. Create Meeting
4. Add Time Slots
5. Share Meeting Link
6. View Bookings
7. Reschedule/Cancel Slots

---

## 👤 Attendee Flow

1. Open Booking Link
2. Select Available Slot
3. Fill Details
4. Book Meeting
5. Receive:
   - Confirmation Email
   - Meet Link
   - Calendar Invite
   - Reminder Emails

---

# 🔒 Authentication Flow

## Normal Login
- JWT token generated
- Stored in frontend
- Used in protected APIs

## Google Login
- OAuth flow
- Refresh token stored once
- Future logins avoid repeated permissions

---

# 📅 Google Calendar Integration

When a meeting is booked:

✅ Google Meet link is generated  
✅ Calendar event is created  
✅ Attendee is added to event  
✅ Automatic reminders are sent by Google  

---

# 🧠 Smart Booking Logic

## Booking Rules
- One slot → One booking
- Booked slots become unavailable
- Host-only rescheduling
- Host-only cancellation

---

# 📬 Email Templates

Beautiful HTML email templates included for:

- Verification
- Booking Confirmation
- Booking Cancellation
- Meeting Cancellation
- Slot Reschedule
- Host Notifications

---

# 📷 Screenshots

Add screenshots here:

```md
![Landing Page](./screenshots/landing.png)

![Dashboard](./screenshots/dashboard.png)

![Booking Page](./screenshots/booking.png)
```

---

# 🚀 Future Improvements

- Drag & Drop Calendar UI
- Zoom Integration
- Microsoft Teams Integration
- Availability Detection
- Timezone Support
- Analytics Dashboard
- Team Scheduling
- Payment Integration

---

# 🧪 Test Scenarios

## Host
- Create meeting
- Add slot
- Reschedule slot
- Cancel slot
- Cancel meeting

## Attendee
- Book slot
- Receive mail
- Receive reminders
- Cancel booking after login

---

# 💡 Key Learning Outcomes

- OAuth 2.0 Integration
- Google Calendar API
- Google Meet Automation
- JWT Authentication
- MongoDB Relationships
- Full-stack Architecture
- Email Automation
- Protected Routes
- REST API Design

---

# 👨‍💻 Developed By

**Jatin Bansal**

Full Stack Developer | MERN Stack | Google APIs | System Design Enthusiast

---

# ⭐ If You Like This Project

Give it a ⭐ on GitHub and share feedback!