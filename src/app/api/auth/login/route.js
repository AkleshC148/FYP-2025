import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/UserSchema';
import { generateAndSendOtp } from '@/lib/otpService';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    await dbConnect();
    
    // 1. Find User
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. CHECK IF VERIFIED (The change you requested)
    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please verify your email to log in.',
        notVerified: true // Flag for frontend to potentially offer a resend button
      }, { status: 403 });
    }

    // 4. Generate and Send 2FA OTP
    await generateAndSendOtp(email);

    return NextResponse.json({ 
      message: 'Credentials verified. OTP sent to email.',
      requireOtp: true 
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}