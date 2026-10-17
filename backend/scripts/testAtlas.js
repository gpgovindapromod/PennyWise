const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Use reliable public DNS resolvers for MongoDB SRV lookups
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testConnection() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ SUCCESS: Successfully connected to MongoDB Atlas (pennywise database)!');
    const collections = await mongoose.connection.db.collections();
    console.log(`Current collections in cluster: ${collections.map(c => c.collectionName).join(', ') || 'None (fresh empty DB)'}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
