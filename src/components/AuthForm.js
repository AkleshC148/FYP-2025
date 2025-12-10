// src/components/AuthForm.jsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AuthForm({ type }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifyButtonClicked, setVerifyButtonClicked] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);


  
  
  const { login, signup } = useAuth();
  const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       if (type === 'login') {
//         await login(email, password);
//       } else {
//         await signup(email, password, name, role);
//       }
      
//       router.push('/dashboard');
//     } catch (err) {
//         setError('An unexpected error occurred');
//     //  setError(err.message);
//         console.log(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
   // In your AuthForm.jsx component

  const verifyOTP = async (e) => {
    e.preventDefault();
    setIsOtpLogin(true);
    setError('');
    setVerifyButtonClicked(true);
    setIsOtpLogin(false);

    // try {
    //   const response = await fetch('/api/auth/send-otp', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    //   });
    //   // You can handle the response here if needed
    // } catch (err) {
    //   setError('Failed to send OTP');
    //   console.log(err);
    // }
  }
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (type === 'login') {
        await login(email, password);
        router.push('/dashboard'); // Redirect to dashboard after login
        } else {
        // For signup
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
        }

        // Show success message and redirect to login
        alert('User created successfully. Please log in to continue.');
        // router.push('/login');
        router.push(`/signup/otp?email=${encodeURIComponent(email)}`); // ← Redirect to login page after signup
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
    };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {type === 'login' ? 'Welcome to AgriSmart' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {type === 'login' 
              ? 'Sign in to access your agricultural dashboard' 
              : 'Join the future of agri-trading'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'signup' && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border dark:text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              {/* <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border dark:text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="transporter">Transporter</option>
                  <option value="warehouse_manager">Warehouse Manager</option>
                </select>
              </div> */}
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* {type=='signup' && <button
            onClick={verifyOTP}
            disabled={isOtpLogin}
            className="w-20% hover:bg-green-700 hover:text-white text-green-700 border border-green-500 py-1 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOtpLogin ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Verify Email'
            )}
          </button> }  */}
        

        {/* {type=='signup' && verifyButtonClicked && <div>
            <div htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="****"
              required
            />
          </div>} */}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border dark:text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              type === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            <a 
              href={type === 'login' ? '/signup' : '/login'}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              {type === 'login' ? 'Sign up' : 'Sign in'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}