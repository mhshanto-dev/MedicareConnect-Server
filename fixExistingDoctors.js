/**
 * fixExistingDoctors.js — One-time migration script
 *
 * Finds all User documents with role='doctor' that do NOT have
 * a matching Doctor profile document, and creates one for each.
 *
 * Safe to run multiple times (idempotent).
 *
 * Usage:
 *   cd backend
 *   node fixExistingDoctors.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'patient' },
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  qualifications: { type: [String], default: [] },
  bio: String,
  consultationFee: { type: Number, required: true },
  availability: [{
    day: String,
    startTime: String,
    endTime: String,
  }],
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

async function fixExistingDoctors() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env file');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 });
  console.log(`✅ Connected to: ${mongoose.connection.host}`);

  // Find all doctor-role users
  const doctorUsers = await User.find({ role: 'doctor' });
  console.log(`\n🔍 Found ${doctorUsers.length} users with role='doctor'`);

  let fixed = 0;
  let skipped = 0;

  for (const user of doctorUsers) {
    const existing = await Doctor.findOne({ userId: user._id });
    if (existing) {
      console.log(`   ⏭️  Skipped: ${user.name} (${user.email}) — profile already exists`);
      skipped++;
    } else {
      await Doctor.create({
        userId: user._id,
        specialty: 'General Practice',
        experience: 0,
        qualifications: [],
        bio: '',
        consultationFee: 0,
        availability: [],
        isVerified: false,
      });
      console.log(`   ✅ Created stub profile for: ${user.name} (${user.email})`);
      fixed++;
    }
  }

  console.log(`\n🎉 Done! Created ${fixed} missing Doctor profiles. Skipped ${skipped} existing profiles.`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

fixExistingDoctors().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
