import mongoose from 'mongoose';
import env from './env.js';

const connectDatabase = async () => {
  try {
    // Replace 'localhost' with '127.0.0.1' to avoid Node.js v18+ Windows IPv6 (::1) ECONNREFUSED
    const normalizedUri = env.mongoUri.replace(
      'mongodb://localhost:',
      'mongodb://127.0.0.1:',
    );

    const conn = await mongoose.connect(normalizedUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error(
      'Troubleshooting: Check if MongoDB is running (e.g., net start MongoDB or mongod)',
    );
    process.exit(1);
  }
};

export default connectDatabase;
