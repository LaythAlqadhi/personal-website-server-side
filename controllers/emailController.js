const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const { OAuth2 } = google.auth;

exports.postEmail = [
  body('name').trim().notEmpty().isLength({ max: 25 }).escape(),
  body('email').trim().notEmpty().isEmail().escape(),
  body('message').trim().notEmpty().isLength({ max: 5000 }).escape(),

  asyncHandler(async (req, res, next) => {
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        accessToken,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: req.body.email,
      to: process.env.EMAIL_USER,
      subject: `New mail from ${req.body.name} (${req.body.email}) via Your Personal Website`,
      text: req.body.message,
    };

    await transporter.sendMail(mailOptions);

    res.sendStatus(200);
  }),
];
