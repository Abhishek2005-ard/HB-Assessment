import app from './app.js';
import connectDatabase from './config/db.js';
import env from './config/env.js';
const startServer = async () => {
    await connectDatabase();
    const server = app.listen(env.port, () => {
        console.log(`Server running on http://localhost:${env.port}`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Error: Port ${env.port} is already in use by another process.`);
            console.error(`Please stop the process using port ${env.port} or change PORT in .env`);
        }
        else {
            console.error('Server error:', err);
        }
        process.exit(1);
    });
};
startServer();
