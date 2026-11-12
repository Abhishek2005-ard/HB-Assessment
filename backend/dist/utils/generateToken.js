import jwt from 'jsonwebtoken';
import env from '../config/env.js';
const generateToken = (id) => {
    return jwt.sign({ id }, env.jwtSecret, {
        expiresIn: '7d',
    });
};
export default generateToken;
