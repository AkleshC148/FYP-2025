import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures one active OTP per email
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // CRITICAL: This document will self-destruct after 300 seconds (5 mins)
  },
});

// This check is important in Next.js to prevent "OverwriteModelError" during hot reloads
export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);