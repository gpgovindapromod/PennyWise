const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Use reliable public DNS resolvers to handle MongoDB Atlas SRV lookups seamlessly
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise';
    
    // Production Connection Pool & Retry Options
    const options = {
      maxPoolSize: 50, // Maintain up to 50 socket connections
      minPoolSize: 10,  // Keep at least 10 sockets open
      serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds instead of hanging
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoUri, options);
    logger.info(`MongoDB Connected successfully`, {
      host: conn.connection.host,
      name: conn.connection.name,
      port: conn.connection.port,
      readyState: conn.connection.readyState
    });

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Attempting automatic reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime connection error', { error: err.message });
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
