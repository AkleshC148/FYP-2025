import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // <--- 1. Import bcrypt
import { findUserByEmail, createUser } from '@/lib/userDB';
import { generateAndSendOtp } from '@/lib/otpService'; // <--- 2. Import your new OTP helper

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();

    // 1. Check if user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 2. Hash the Password (Security Requirement)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Prepare New User Object
    // Note: We set isVerified to FALSE initially.
    const newUser = {
      // id: Date.now().toString(), // Mongoose will auto-generate _id, you usually don't need this line unless your createUser helper requires it.
      email,
      password: hashedPassword, // Store the hash, not the plain text!
      name: name || email.split('@')[0],
      role: role || 'farmer',
      isVerified: false, // <--- Crucial for the flow
      createdAt: new Date()
    };

    // 4. Save User to DB (Unverified)
    const savedUser = await createUser(newUser);
    if (!savedUser) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    
    // We use the helper function to generate and email the code.
    await generateAndSendOtp(email);

    // 6. Return Success
    return NextResponse.json({ 
      message: 'Signup successful. OTP sent to your email.',
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}