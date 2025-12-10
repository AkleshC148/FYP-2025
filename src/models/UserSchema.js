import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, // This will store the bcrypt hash
  },
  role: {
    type: String,
    default: 'farmer', // Default role if none is provided
  },
  isVerified: {
    type: Boolean,
    default: false, // Crucial: Users start as unverified until OTP check
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent recompilation error in Next.js
export default mongoose.models.User || mongoose.model('User', UserSchema);