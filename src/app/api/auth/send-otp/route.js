import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb'; // Use your existing DB connection file
import Otp from '@/models/OtpSchema';

export async function POST(req) {
  try {
    // 1. Parse Request
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // 2. Connect to DB
    await dbConnect();

    // 3. Generate a secure 6-digit OTP
    const otpValue = crypto.randomInt(100000, 999999).toString();

    // 4. Save to MongoDB
    // findOneAndUpdate with upsert: true is perfect here.
    // If an OTP exists for this email, it updates it (and resets the timer).
    // If not, it creates a new one.
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpValue, createdAt: new Date() }, // Reset time
      { upsert: true, new: true }
    );

    // 5. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: true, // Use true for port 465
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 6. Send Email
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

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}