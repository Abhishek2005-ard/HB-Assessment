import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_auth_db',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-token',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

export default env;
