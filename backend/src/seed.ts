import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_auth_db';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    profilePicture: { type: String, default: '' },
    provider: { type: String, default: 'local' },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@hbplus.fit',
    password: 'admin123',
    role: 'admin',
    provider: 'local',
  },
  {
    name: 'John Doe',
    email: 'john@hbplus.fit',
    password: 'user1234',
    role: 'user',
    provider: 'local',
  },
  {
    name: 'Jane Smith',
    email: 'jane@hbplus.fit',
    password: 'user1234',
    role: 'user',
    provider: 'local',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const userData of seedUsers) {
      const exists = await User.findOne({ email: userData.email });

      if (exists) {
        console.log(`  ⏭  User "${userData.email}" already exists — skipping`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await User.create({ ...userData, password: hashedPassword });
      console.log(`  ✅ Created ${userData.role}: ${userData.email} (password: ${userData.password})`);
    }

    console.log('\nSeed complete!');
    console.log('\n--- Login Credentials ---');
    console.log('Admin:  admin@hbplus.fit  /  admin123');
    console.log('User:   john@hbplus.fit   /  user1234');
    console.log('User:   jane@hbplus.fit   /  user1234');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();

