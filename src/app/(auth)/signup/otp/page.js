"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { ShieldCheck, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// 1. Internal component that handles the logic and uses searchParams
function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const modeParam = searchParams.get("mode");
    
    if (emailParam) setEmail(emailParam);
    if (modeParam) setMode(modeParam);
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || otp.length < 6) {
      setError("Please enter a valid email and the 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      if (data.user && setUser) {
        setUser(data.user);
      }

      setSuccess("Verified! Redirecting...");
      router.push("/dashboard"); 

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if(!email) return;
    setResendLoading(true);
    setResendMessage("");
    setError("");

    try {
        const response = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        
        if(!response.ok) throw new Error("Failed to resend");
        
        setResendMessage("Code sent successfully!");
    } catch(err) {
        setError("Could not resend code. Please try again.");
    } finally {
        setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {mode === 'signup' ? 'Email Verification' : 'Two-Step Verification'}
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          We sent a verification code to <br />
          <span className="font-medium text-gray-900">{email || "your email"}</span>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleVerify}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="otp" className="sr-only">OTP Code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              autoComplete="one-time-code"
              required
              className="appearance-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-lg tracking-widest text-center"
              placeholder="Enter 6-Digit Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
        </div>

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
        
        {resendMessage && (
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700 text-center font-medium">{resendMessage}</p>
          </div>
        )}

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

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{' '}
          <button 
            onClick={handleResend}
            disabled={resendLoading}
            className="font-medium text-green-600 hover:text-green-500 disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}

// 2. Main exported component with the Suspense wrapper
export default function OtpVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin h-10 w-10 text-green-600" />
          <p className="mt-4 text-gray-600">Preparing verification...</p>
        </div>
      }>
        <VerificationContent />
      </Suspense>
    </div>
  );
}