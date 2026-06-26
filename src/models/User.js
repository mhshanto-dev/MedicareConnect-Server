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
  phone: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
  ],
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);
