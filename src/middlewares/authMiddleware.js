import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

// Dual-mode auth middleware:
//   1. Check for JWT Bearer token first (email/password flow)
//   2. Fall back to Better Auth session cookie (Google OAuth flow)
export const protect = async (req, res, next) => {
  // ── Strategy 1: JWT Bearer Token ──
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user) return next();
    } catch (error) {
      // JWT failed — fall through to Better Auth session check
    }
  }

  // ── Strategy 2: Better Auth Session Cookie ──
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      // Find or create Mongoose user from Better Auth session
      let user = await User.findOne({ email: session.user.email });
      if (user) {
        req.user = user;
        return next();
      }
    }
  } catch (error) {
    // Session check failed
  }

  // ── Neither strategy worked ──
  res.status(401).json({ message: 'Not authorized, no valid token or session' });
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const doctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a doctor' });
  }
};

export const patient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a patient' });
  }
};
