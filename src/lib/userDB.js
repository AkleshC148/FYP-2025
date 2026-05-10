import connectToDatabase from './mongodb';
import User from '../models/UserSchema';

/**
 * Finds a user by their email address.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
export async function findUserByEmail(email) {
  try {
    await connectToDatabase();
    // .lean() returns a plain JavaScript object, not a Mongoose document.
    // It's faster for read-only operations.
    const user = await User.findOne({ email }).lean();
    // console.log('Found user:', user);
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export async function createUser(userData) {
  try {
    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { new: true, upsert: true, lean: true }
    );
    return user;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
}