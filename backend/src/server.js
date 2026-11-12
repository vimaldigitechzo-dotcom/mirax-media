import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma, { checkDatabaseConnection } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Validate critical environment configurations on boot
function validateEnvironment() {
  const missing = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.ADMIN_API_KEY) missing.push('ADMIN_API_KEY');

  if (missing.length > 0) {
    console.warn(
      `[Environment Warning]: Missing recommended variables: ${missing.join(', ')}. Review backend/.env.`
    );
  }
}

validateEnvironment();

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 MIRAX MEDIA Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local Base URL: http://localhost:${PORT}`);
  console.log(`🩺 Health Check:   http://localhost:${PORT}/api/health`);
  console.log(`📬 Contact API:    http://localhost:${PORT}/api/contact`);
  console.log(`======================================================\n`);

  // Asynchronously test database connection
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.isConnected) {
    console.log(`✅ [Database]: Neon PostgreSQL connected successfully (${dbStatus.latencyMs}ms).`);
  } else {
    console.warn(`⚠️ [Database Warning]: ${dbStatus.error}`);
    console.warn(`   Configure your Neon DATABASE_URL in backend/.env to connect.`);
  }
});

// Graceful Shutdown Handlers
async function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('Database connection pool closed.');
    } catch (err) {
      console.error('Error during database disconnect:', err.message);
    }
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default server;
