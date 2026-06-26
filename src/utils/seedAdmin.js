import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await User.create({
        name: 'Super Admin',
        email: 'admin@medicareconnect.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Default Admin account created successfully');
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
