require("dotenv").config({path: './.env'});
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });
// console.log("EMAIL", process.env.EMAIL);
// console.log("CLIENT_ID", process.env.CLIENT_ID ? "set" : "missing");
// console.log("CLIENT_SECRET", process.env.CLIENT_SECRET ? "set" : "missing");
// console.log("REFRESH_TOKEN", process.env.REFRESH_TOKEN);
  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(`Failed to create access token : ${err}`);
      }
      resolve(token);
    });
  });
  // console.log(accessToken);
  

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken: accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });

  return transporter;
};

const sendEmail = async (emailOptions) => {
  const emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};

module.exports = { sendEmail };
