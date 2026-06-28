/**
 * seedDoctors.js — Production Doctor Seeder
 *
 * Run this ONCE to populate doctors in your MongoDB Atlas production database.
 *
 * Usage:
 *   cd backend
 *   node seedDoctors.js
 *
 * It will:
 *   1. Connect to your MongoDB Atlas cluster
 *   2. Create 8 User documents with role='doctor'
 *   3. Create matching Doctor profile documents
 *   4. Skip if doctors already exist (idempotent)
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

// ── Inline schemas (avoid importing from src/ to keep this standalone) ──
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'patient' },
  profilePicture: String,
  phone: String,
  gender: String,
}, { timestamps: true });

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  qualifications: { type: [String], default: [] },
  bio: String,
  consultationFee: { type: Number, required: true },
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: String,
    endTime: String,
  }],
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

// ── Seed Data ──
const doctorSeedData = [
  {
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@medicare.com',
    specialty: 'Cardiology',
    experience: 12,
    qualifications: ['MD - Harvard Medical School', 'Fellowship in Cardiology - Johns Hopkins', 'Board Certified Cardiologist'],
    bio: 'Dr. Mitchell is a board-certified cardiologist with over 12 years of experience treating complex heart conditions. She specializes in preventive cardiology and heart failure management.',
    consultationFee: 150,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' },
    ],
    phone: '+1-555-0101',
    gender: 'female',
  },
  {
    name: 'Dr. James Okonkwo',
    email: 'james.okonkwo@medicare.com',
    specialty: 'Neurology',
    experience: 15,
    qualifications: ['MD - Stanford University', 'Neurology Residency - UCSF', 'Sub-specialty in Epilepsy', 'Board Certified Neurologist'],
    bio: 'Dr. Okonkwo brings 15 years of expertise in diagnosing and treating neurological disorders including migraines, epilepsy, and stroke rehabilitation.',
    consultationFee: 180,
    availability: [
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
    ],
    phone: '+1-555-0102',
    gender: 'male',
  },
  {
    name: 'Dr. Emily Chen',
    email: 'emily.chen@medicare.com',
    specialty: 'Pediatrics',
    experience: 8,
    qualifications: ['MD - Yale School of Medicine', 'Pediatrics Residency - Boston Children\'s Hospital', 'Board Certified Pediatrician'],
    bio: 'Dr. Chen is passionate about children\'s health and development. She provides comprehensive care for infants, children, and adolescents in a warm, family-friendly environment.',
    consultationFee: 120,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
    ],
    phone: '+1-555-0103',
    gender: 'female',
  },
  {
    name: 'Dr. Marcus Thompson',
    email: 'marcus.thompson@medicare.com',
    specialty: 'Orthopedics',
    experience: 20,
    qualifications: ['MD - Duke University School of Medicine', 'Orthopedic Surgery Residency', 'Sports Medicine Fellowship', 'Board Certified Orthopedic Surgeon'],
    bio: 'With 20 years of experience, Dr. Thompson specializes in sports medicine and minimally invasive orthopedic surgery. He has treated professional athletes and weekend warriors alike.',
    consultationFee: 200,
    availability: [
      { day: 'Monday', startTime: '07:00', endTime: '15:00' },
      { day: 'Wednesday', startTime: '07:00', endTime: '15:00' },
      { day: 'Friday', startTime: '07:00', endTime: '12:00' },
    ],
    phone: '+1-555-0104',
    gender: 'male',
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@medicare.com',
    specialty: 'Dermatology',
    experience: 10,
    qualifications: ['MD - Columbia University College of Physicians', 'Dermatology Residency - NYU Langone', 'Cosmetic Dermatology Certificate'],
    bio: 'Dr. Sharma offers comprehensive dermatological care covering acne, eczema, psoriasis, skin cancer screening, and cosmetic procedures. She believes every patient deserves healthy, glowing skin.',
    consultationFee: 130,
    availability: [
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
    ],
    phone: '+1-555-0105',
    gender: 'female',
  },
  {
    name: 'Dr. Robert Williams',
    email: 'robert.williams@medicare.com',
    specialty: 'General Practice',
    experience: 18,
    qualifications: ['MD - University of Michigan', 'Family Medicine Residency', 'Board Certified Family Physician'],
    bio: 'Dr. Williams is your trusted family doctor for over 18 years. He provides comprehensive primary care for all ages, focusing on preventive medicine and chronic disease management.',
    consultationFee: 80,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '18:00' },
      { day: 'Friday', startTime: '08:00', endTime: '16:00' },
    ],
    phone: '+1-555-0106',
    gender: 'male',
  },
  {
    name: 'Dr. Aisha Patel',
    email: 'aisha.patel@medicare.com',
    specialty: 'Psychiatry',
    experience: 9,
    qualifications: ['MD - Emory University', 'Psychiatry Residency - Mass General Hospital', 'Cognitive Behavioral Therapy Certification'],
    bio: 'Dr. Patel provides compassionate mental health care for anxiety, depression, ADHD, and other psychiatric conditions. She uses evidence-based approaches including therapy and medication management.',
    consultationFee: 160,
    availability: [
      { day: 'Monday', startTime: '12:00', endTime: '20:00' },
      { day: 'Wednesday', startTime: '12:00', endTime: '20:00' },
      { day: 'Friday', startTime: '12:00', endTime: '18:00' },
    ],
    phone: '+1-555-0107',
    gender: 'female',
  },
  {
    name: 'Dr. David Kim',
    email: 'david.kim@medicare.com',
    specialty: 'Ophthalmology',
    experience: 14,
    qualifications: ['MD - UCLA David Geffen School of Medicine', 'Ophthalmology Residency - Wills Eye Hospital', 'Retina Fellowship', 'Board Certified Ophthalmologist'],
    bio: 'Dr. Kim specializes in medical and surgical eye care including cataract surgery, glaucoma treatment, retinal disorders, and LASIK consultations. Committed to preserving and restoring your vision.',
    consultationFee: 140,
    availability: [
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00' },
    ],
    phone: '+1-555-0108',
    gender: 'male',
  },
];

// ── Main Seed Function ──
async function seedDoctors() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env file');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 });
  console.log(`✅ Connected to: ${mongoose.connection.host}`);

  // Check if doctors already exist
  const existingCount = await Doctor.countDocuments();
  if (existingCount > 0) {
    console.log(`ℹ️  ${existingCount} doctors already exist in the database.`);
    console.log('   To re-seed, delete existing doctors first: db.doctors.deleteMany({})');
    await mongoose.disconnect();
    return;
  }

  console.log(`\n🌱 Seeding ${doctorSeedData.length} doctors...`);
  const hashedPassword = await bcrypt.hash('Doctor@123', 10);

  for (const data of doctorSeedData) {
    const { name, email, specialty, experience, qualifications, bio, consultationFee, availability, phone, gender } = data;

    // 1. Create or reuse User document
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'doctor',
        phone,
        gender,
      });
    } else {
      // Ensure role is set correctly
      if (user.role !== 'doctor') {
        user.role = 'doctor';
        await user.save();
      }
    }

    // 2. Create Doctor profile (linked to User)
    const doctor = await Doctor.create({
      userId: user._id,
      specialty,
      experience,
      qualifications,
      bio,
      consultationFee,
      availability,
      isVerified: true,
    });

    console.log(`   ✅ Created: ${name} (${specialty}) — ID: ${doctor._id}`);
  }

  console.log(`\n🎉 Done! ${doctorSeedData.length} doctors seeded successfully.`);
  console.log('\n📋 Doctor login credentials (for testing):');
  console.log('   Email: <doctor-email>@medicare.com');
  console.log('   Password: Doctor@123\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB.');
}

seedDoctors().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
