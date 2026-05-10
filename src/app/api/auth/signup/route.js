import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/userDB';
import { generateAndSendOtp } from '@/lib/otpService';

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: role || 'farmer',
      isVerified: false, // Initially false
      createdAt: new Date()
    };

    const savedUser = await createUser(newUser);
    if (!savedUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Send the Verification OTP
    await generateAndSendOtp(email);

    return NextResponse.json({ 
      message: 'Signup successful. Please verify your email.',
      requireVerify: true
    }, { status: 200 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}