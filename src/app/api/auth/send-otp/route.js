import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { findUserByEmail } from '@/lib/userDB'; // Use your userDB helper
import { generateAndSendOtp } from '@/lib/otpService'; // Use your OTP helper

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Security Check: Only resend OTPs to existing users
    // This prevents attackers from spamming random emails using your API.
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Use your Helper to Generate, Save, and Email the OTP
    // This reuses the exact same logic as your Signup route.
    await generateAndSendOtp(email);

    return NextResponse.json({ message: 'OTP resent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}