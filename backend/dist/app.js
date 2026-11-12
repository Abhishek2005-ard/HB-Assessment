import cors from 'cors';
import express from 'express';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
const app = express();
const allowedOrigins = [
    env.clientOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like curl, postman) or matching dev origins
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);
export default app;
