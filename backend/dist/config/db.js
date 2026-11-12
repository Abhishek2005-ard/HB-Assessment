import mongoose from 'mongoose';
import env from './env.js';
const connectDatabase = async () => {
    try {
        const isSrv = env.mongoUri.startsWith('mongodb+srv://');
        const normalizedUri = isSrv
            ? env.mongoUri
            : env.mongoUri.replace('mongodb://localhost:', 'mongodb://127.0.0.1:');
        const options = {
            serverSelectionTimeoutMS: 15000,
        };
        if (!isSrv) {
            options.family = 4; // Localhost IPv4 preference
        }
        const conn = await mongoose.connect(normalizedUri, options);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('MongoDB connection failed:', error);
        console.error('Troubleshooting: Ensure database URI and IP whitelist are valid (MongoDB Atlas: add 0.0.0.0/0 or current IP).');
        process.exit(1);
    }
};
export default connectDatabase;
