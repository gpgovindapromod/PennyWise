const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function wipeDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise';
  console.log(`Connecting to database at ${uri}...`);
  await mongoose.connect(uri);

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    const count = await collection.countDocuments();
    await collection.deleteMany({});
    console.log(`Cleared ${count} document(s) from collection: ${collection.collectionName}`);
  }

  console.log('✅ Database is now completely empty.');
  await mongoose.disconnect();
}

wipeDatabase().catch(err => {
  console.error('Error wiping database:', err);
  process.exit(1);
});
