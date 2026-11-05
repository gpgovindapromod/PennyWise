const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { initRetentionScheduler } = require('./utils/retentionScheduler');
const logger = require('./utils/logger');

let server = null;
let scheduler = null;

connectDB().then(() => {
  server = app.listen(config.port, () => {
    logger.info(`PennyWise Server started`, {
      port: config.port,
      environment: config.env,
      nodeVersion: process.version
    });
    // Initialize automated 90-day retention scheduler
    scheduler = initRetentionScheduler({ retentionDays: 90 });
  });
}).catch((err) => {
  logger.error(`PennyWise Server Init Error`, { error: err.message });
  process.exit(1);
});

// Graceful shutdown handler
function handleShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (scheduler && scheduler.stop) {
    scheduler.stop();
  }
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection safely terminated.');
        process.exit(0);
      } catch (e) {
        logger.error('Error closing MongoDB connection', { error: e.message });
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection detected', { reason: reason?.message || reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception detected', { error: err.message, stack: err.stack });
});
