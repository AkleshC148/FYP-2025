// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAuthCookie } from '@/lib/auth';
import { findUserByEmail } from '@/lib/userDB';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function GET() {
  try {
    // 1. Get token from cookie
    const token =await getAuthCookie();
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // 3. Find user in DB (CRITICAL FIX: Added 'await')
    const user = await findUserByEmail(decoded.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Return user data
    // Note: user._id is standard for MongoDB, but if your helper maps it to id, that's fine too.
    return NextResponse.json({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}