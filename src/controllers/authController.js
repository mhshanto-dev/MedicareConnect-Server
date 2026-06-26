import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

// POST /api/users/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ name, email, password: hashedPassword, role });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) { next(error); }
};

// POST /api/users/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) { next(error); }
};

// GET /api/users/me  —  returns the current user from JWT
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// POST /api/users/sync-google
// Called by the frontend after a successful Better Auth Google sign-in.
// Creates or finds the user in our Mongoose User collection and returns a JWT.
export const syncGoogleUser = async (req, res, next) => {
  try {
    const { email, name, googleId, image } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user from Google data (no password required)
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: 'google-oauth-no-password', // placeholder, never used for login
        googleId,
        profilePicture: image || 'default-avatar.png',
        role: 'patient', // default role for new Google users
      });
    } else {
      // Update Google fields on existing user
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) { next(error); }
};
