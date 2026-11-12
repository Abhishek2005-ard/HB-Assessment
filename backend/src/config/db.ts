import mongoose from 'mongoose';
import env from './env.js';

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('----------------------------------------------------');
    console.error('ERROR: MONGODB_URI is not set in Environment Variables!');
    console.error('Please add MONGODB_URI to your Render Environment Variables.');
    console.error('----------------------------------------------------');
    process.exit(1);
  }

  try {
    const isSrv = env.mongoUri.startsWith('mongodb+srv://');
    const normalizedUri = isSrv
      ? env.mongoUri
      : env.mongoUri.replace('mongodb://localhost:', 'mongodb://127.0.0.1:');

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 15000,
    };

    if (!isSrv) {
      options.family = 4;
    }

    const conn = await mongoose.connect(normalizedUri, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error('MongoDB connection failed:', error);
    console.error('Troubleshooting:');
    console.error('1. In MongoDB Atlas, go to Network Access.');
    console.error('2. Ensure IP 0.0.0.0/0 (Allow access from anywhere) is enabled.');
    console.error('----------------------------------------------------');
    process.exit(1);
  }
};

export default connectDatabase;
