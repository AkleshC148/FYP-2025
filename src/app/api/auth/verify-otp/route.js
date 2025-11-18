import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Use your existing DB connection file
import Otp from '@/models/OtpSchema';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the record
    const record = await Otp.findOne({ email });

    // 2. Check scenarios
    if (!record) {
      // If null, the TTL index likely deleted it because it expired
      return NextResponse.json({ message: 'OTP expired or does not exist. Request a new one.' }, { status: 400 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // 3. OTP Matches
    // Note: We DO NOT delete the OTP here yet.
    // Why? The user might verify the OTP but fail the rest of the signup form (e.g., bad password).
    // If we delete it now, they have to request a new one just to fix a typo in their username.
    // We let the TTL (5 mins) handle the cleanup naturally.

    return NextResponse.json({ message: 'Verification successful' }, { status: 200 });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}