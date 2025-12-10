import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // <--- Security Update
import dbConnect from '@/lib/mongodb';
import User from '@/models/UserSchema';
import { generateAndSendOtp } from '@/lib/otpService'; // <--- Use your helper

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    await dbConnect();

    // 1. Find User (Directly via Mongoose to ensure we get the password field)
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Secure Password Check
    // We use bcrypt to compare the input with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. STOP! Do not generate a token yet.
    // Instead, generate and send the 2FA OTP.
    await generateAndSendOtp(email);

    // 4. Tell Frontend to redirect to the OTP Entry page
    return NextResponse.json({ 
      message: 'Credentials verified. OTP sent to email.',
      requireOtp: true // A flag for your frontend to know what to do
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}