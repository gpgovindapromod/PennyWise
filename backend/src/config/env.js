const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Production Mandatory Validation
if (isProduction) {
  const mandatoryProdVars = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const missing = mandatoryProdVars.filter((v) => !process.env[v] || process.env[v].trim() === '');
  if (missing.length > 0) {
    throw new Error(`[FATAL CONFIG ERROR] Production mode requires: ${missing.join(', ')}.`);
  }

  // Enforce high-entropy JWT_SECRET in production
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('[FATAL CONFIG ERROR] JWT_SECRET must be at least 32 characters in production.');
  }

  // Validate MONGODB_URI starts with mongodb:// or mongodb+srv://
  if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('[FATAL CONFIG ERROR] Invalid MONGODB_URI protocol in production.');
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise',
  jwtSecret: process.env.JWT_SECRET || 'pennywise_super_secure_jwt_secret_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction
};

module.exports = config;
