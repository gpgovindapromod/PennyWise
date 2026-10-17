const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`[Config Warning] Missing environment variables: ${missingVars.join(', ')}. Using safe development defaults.`);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise',
  jwtSecret: process.env.JWT_SECRET || 'pennywise_super_secure_jwt_secret_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production'
};

module.exports = config;
