import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  googleId: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png',
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
