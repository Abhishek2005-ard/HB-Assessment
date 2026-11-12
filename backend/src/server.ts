import app from './app.js';
import connectDatabase from './config/db.js';
import env from './config/env.js';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running on port ${env.port} (0.0.0.0)`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${env.port} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
