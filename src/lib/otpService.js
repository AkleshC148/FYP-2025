// src/lib/otpService.js
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Otp from '@/models/OtpSchema';

export async function generateAndSendOtp(email) {
  // 1. Generate OTP
  const otpValue = crypto.randomInt(100000, 999999).toString();

  // 2. Save to DB
  await Otp.findOneAndUpdate(
    { email },
    { otp: otpValue, createdAt: new Date() },
    { upsert: true, new: true }
  );

  // 3. Send Email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Smart Agriculture System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${otpValue}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify your email</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 5px; color: #2E7D32;">${otpValue}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
  });

  return true;
}