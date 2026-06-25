import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience'],
  },
  qualifications: {
    type: [String],
    required: [true, 'Please add qualifications'],
  },
  bio: {
    type: String,
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please add a consultation fee'],
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: String, // e.g., "09:00"
    endTime: String, // e.g., "17:00"
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Doctor', doctorSchema);
