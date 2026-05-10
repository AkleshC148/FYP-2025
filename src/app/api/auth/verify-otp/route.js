import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/OtpSchema';
import User from '@/models/UserSchema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const TOKEN_NAME = 'token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify OTP
    const record = await Otp.findOne({ email });
    if (!record || record.otp !== otp) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // 2. Mark User as Verified
    // This handles both "Initial Signup Verification" AND "Login 2FA"
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true }, // Always ensure it's true after a successful OTP check
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 3. Generate JWT (Log them in immediately)
    const accessToken = jwt.sign(
      { email: user.email, role: user.role, id: user._id },
      JWT_SECRET,
      { expiresIn: TOKEN_MAX_AGE }
    );

    const cookieSerialized = serialize(TOKEN_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_MAX_AGE,
      path: '/',
    });

    // 4. Cleanup OTP
    await Otp.deleteOne({ email });

    const response = NextResponse.json({
      message: 'Verification successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

    response.headers.set('Set-Cookie', cookieSerialized);
    return response;

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}