//--LIBRARY IMPORTS--
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

//--CONFIG--
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

//TOKEN MAIL
const resetPasswordMail = async (clientEmail, resetToken) => {
  const info = await transporter.sendMail({
    from: process.env.USER_EMAIL,
    to: [
      clientEmail, //Client mail for reset token
    ],
    subject: "Reset Password - Dev match",
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

    <h2 style="color: #333;">Password Reset Request</h2>

    <p>Hello,</p>

    <p>We received a request to reset your password.</p>

    <p>Your password reset token is:</p>

    <div style="
        border: 2px solid #4CAF50;
        border-radius: 8px;
        padding: 16px;
        background-color: #f4f4f4;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 2px;
        font-family: monospace;
        color: #2c3e50;
        margin: 20px 0;
    ">
        ${resetToken}
    </div>

    <p>This token is valid for <strong>15 minutes</strong>.</p>

    <p>If you did not request a password reset, you can safely ignore this email.</p>

    <br>

    <p>Regards,</p>
    <p><strong>Rishi Tech.io Pvt. Ltd.</strong></p>

</div>
`,
  });

  return info;
};

//GENRATE RANDOM TOKEN WITH CRYPTO:NODE
const forgetRandomToken = () => {
  const randomToken = crypto.randomBytes(3);

  return randomToken.toString("hex");
};

module.exports = {
  resetPasswordMail,
  forgetRandomToken,
};
