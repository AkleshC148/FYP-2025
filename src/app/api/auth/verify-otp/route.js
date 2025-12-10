import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/OtpSchema';
import User from '@/models/UserSchema'; // Needed to update user status

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the OTP record
    const record = await Otp.findOne({ email });

    if (!record) {
      return NextResponse.json({ message: 'OTP expired or does not exist. Request a new one.' }, { status: 400 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // --- NEW: Update User & Auto-Login (Matches PDF Flow) ---

    // 2. Mark User as Verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User record not found' }, { status: 404 });
    }

    // 3. Generate Access Token (JWT)
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Set HTTP-Only Cookie
    const cookieSerialized = serialize('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    // 5. Delete the used OTP (Security Best Practice)
    await Otp.deleteOne({ email });

    // 6. Return Response with Cookie
    const response = NextResponse.json({
      message: 'Verification successful',
      user: { name: user.name, email: user.email, role: user.role }
    }, { status: 200 });

    response.headers.set('Set-Cookie', cookieSerialized);

    return response;
    // -------------------------------------------------------

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}