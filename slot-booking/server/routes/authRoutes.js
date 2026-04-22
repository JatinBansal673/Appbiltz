const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { google } = require("googleapis");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

const getGoogleAuthUrl = (forceConsent) => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: forceConsent ? "consent" : "select_account",
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events"
    ]
  });
};

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if(!name || ! email || !password) {
    return res.status(400).json({message: "All fields are mandatory"})
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(20).toString("hex");

  await User.create({
    name,
    email,
    password: hashed,
    isVerified: false,
    verificationToken
  });

  const { subject, html } = emailTemplates.verificationEmail(name, verificationToken);
  await sendEmail({ from:`"Slot Booking Team" <${process.env.EMAIL}>`, to: email, subject, html });

  res.status(201).json({
    message: "Signup successful. Check your email to verify your account."
  });
});

// Verify email
router.get("/verify/:token", async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ message: "Invalid verification token." });

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  // res.json({ message: "Email verified successfully." });
  res.redirect(`${process.env.VITE_APP_FRONTEND_URL}/oauth?token=${token}`);
});

// Login
router.post("/login", async (req, res) => {
  if(!req.body.email || !req.body.password) {
    return res.status(400).json({message: "Please fill in the required details"});
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({message: "User not found"});

  if (!user.isVerified) return res.status(401).json({message:"Please verify your email first"});

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(400).json({message:"Invalid password"});

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
  res.header("Authorization", token).json({ token });
});

router.get("/google", async (req, res) => {
  res.json({
    url: getGoogleAuthUrl(false)
  });
});

router.get("/google/consent", (req, res) => {
  const url = getGoogleAuthUrl(true);
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ message: "Missing authorization code" });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const profile = await oauth2.userinfo.get();

    const email = profile.data.email;
    const name = profile.data.name || email.split("@")[0];
    if (!email) return res.status(400).json({ message: "Unable to retrieve Google email" });

    let user = await User.findOne({ email });
    if (!user) {
      if (!tokens.refresh_token) {
        return res.redirect(`${process.env.VITE_APP_BACKEND_URL}/api/v1/auth/google/consent`);
      }
      user = await User.create({
        name,
        email,
        isVerified: true,
        googleRefreshToken: tokens.refresh_token
      });
    } else {
      if (!user.googleRefreshToken) {
        return res.redirect(`${process.env.VITE_APP_BACKEND_URL}/api/v1/auth/google/consent`);
      }

      if (tokens.refresh_token) {
        user.googleRefreshToken = tokens.refresh_token;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
    // res.header("Authorization", token).json({ token ,user});
    res.redirect(`${process.env.VITE_APP_FRONTEND_URL}/oauth?token=${token}`);
  } catch (err) {
    console.error("Google callback failed:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});

module.exports = router;