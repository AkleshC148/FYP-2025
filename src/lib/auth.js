import { cookies } from 'next/headers';

// NOTE: We don't usually use this set function in Route Handlers anymore.
// We set headers manually in the response (like we did in verify-otp).
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    sameSite: 'strict'
  });
}

// CRITICAL FIX: Added 'async' and 'await'
export async function getAuthCookie() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get('token');
  return token?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
}