const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../services/email");
const emailTemplates = require("../utils/emailTemplates");

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

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
  await sendEmail({ from: process.env.EMAIL, to: email, subject, html });

  res.status(201).json({
    message: "Signup successful. Check your email to verify your account."
  });
});

// Verify email
router.get("/verify/:token", async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) return res.status(400).json({ message: "Invalid verification token." });

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({ message: "Email verified successfully." });
});

// Login
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json("User not found");

  if (!user.isVerified) return res.status(401).json("Please verify your email first");

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(400).json("Invalid password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
  res.header("Authorization", token).json({ token });
});

module.exports = router;