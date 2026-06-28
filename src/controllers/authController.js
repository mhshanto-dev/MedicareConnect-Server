import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

// POST /api/users/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, gender } = req.body;
    
    if (role === 'admin') {
      res.status(403);
      throw new Error('Admin registration is not allowed');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ name, email, password: hashedPassword, role, phone, gender });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        token: generateToken(user._id)
      });
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
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      status: user.status,
      profilePicture: user.profilePicture,
      favorites: user.favorites,
    });
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

// PUT /api/users/profile — Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      status: updatedUser.status,
      profilePicture: updatedUser.profilePicture,
      favorites: updatedUser.favorites,
    });
  } catch (error) { next(error); }
};

// PUT /api/users/password — Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Current password and new password are required');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Skip password check for Google OAuth users
    if (user.password !== 'google-oauth-no-password') {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) { next(error); }
};

// GET /api/users/favorites — Get favorite doctors
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'userId', select: 'name email profilePicture' },
    });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user.favorites);
  } catch (error) { next(error); }
};

// POST /api/users/favorites — Add doctor to favorites
export const addFavorite = async (req, res, next) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      res.status(400);
      throw new Error('doctorId is required');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Avoid duplicates
    const alreadyFavorited = user.favorites.some(
      (fav) => fav.toString() === doctorId.toString()
    );

    if (alreadyFavorited) {
      return res.status(400).json({ message: 'Doctor already in favorites' });
    }

    user.favorites.push(doctorId);
    await user.save();

    res.json({ message: 'Doctor added to favorites', favorites: user.favorites });
  } catch (error) { next(error); }
};

// DELETE /api/users/favorites/:doctorId — Remove doctor from favorites
export const removeFavorite = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== doctorId.toString()
    );

    await user.save();

    res.json({ message: 'Doctor removed from favorites', favorites: user.favorites });
  } catch (error) { next(error); }
};
