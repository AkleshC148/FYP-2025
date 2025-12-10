"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Next.js navigation
import { ShieldCheck, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State Management
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 

  // 2. The Submit Logic
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Basic Validation
    if ( otp.length < 6) {
      setError("Please enter a valid the 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      // 3. Using FETCH API
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // 4. Success Handling
      setSuccess("Verified! Redirecting...");
      
      // Optional: Store user data if returned
      // localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to Dashboard after 1 second
      setTimeout(() => {
        router.push("/dashboard"); // Change to your actual home/dashboard route
      }, 1500);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* --- Header Section --- */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Two-Step Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification code to <br />
            <span className="font-medium text-gray-900">{email || "your email"}</span>
          </p>
        </div>

        {/* --- Form Section --- */}
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                required
                className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-lg tracking-widest text-center"
                placeholder="Enter 6-Digit Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only numbers, max 6
              />
            </div>
          </div>

          {/* --- Feedback Messages --- */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700 text-center font-medium">{success}</p>
            </div>
          )}

          {/* --- Submit Button --- */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}
                transition duration-150 ease-in-out`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Proceed
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* --- Resend Option --- */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button 
              onClick={() => alert("Trigger Resend Logic Here")} // Hook this up to your /api/auth/send-otp route later
              className="font-medium text-green-600 hover:text-green-500"
            >
              Resend
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}