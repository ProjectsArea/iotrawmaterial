const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'datapro2025@gmail.com', 
      pass: 'smcl ifcd tmkt rrik'
  }
});

exports.sendOTP = async (to, otp) => {
  await transporter.sendMail({
    from: `"DataPro Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your Email',
    html: `<h1>Your OTP is: ${otp}</h1>`
  });
};
