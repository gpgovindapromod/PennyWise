/**
 * Seed or Create Travel Company User CLI
 * Usage:
 *   node backend/scripts/createTravelAdmin.js [email] [password] [name] [companyName]
 *
 * Example:
 *   node backend/scripts/createTravelAdmin.js travel@pennywise.com travel123 "Admin User" "PennyWise Tours & Travels"
 */

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const CompanySettings = require('../src/models/CompanySettings');
const Account = require('../src/models/Account');

const email = process.argv[2] || 'smiletrips@gmail.com';
const password = process.argv[3] || '123456';
const name = process.argv[4] || 'Smile Trips';
const companyName = process.argv[5] || 'Smile Trips';

async function createTravelAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise';
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri);

  const cleanEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: cleanEmail }).select('+password');

  if (user) {
    console.log(`User ${cleanEmail} already exists. Updating role to travel_admin...`);
    user.role = 'travel_admin';
    user.companyName = companyName;
    user.name = name;
    user.password = password; // pre-save will rehash
    await user.save();
    console.log(`Updated existing user to travel_admin.`);
  } else {
    console.log(`Creating new travel_admin user: ${cleanEmail}...`);
    user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: 'travel_admin',
      companyName,
      status: 'active'
    });
    console.log(`Created travel_admin user successfully.`);
  }

  // Ensure CompanySettings exists
  let settings = await CompanySettings.findOne({ companyId: user._id });
  if (!settings) {
    settings = await CompanySettings.create({
      companyId: user._id,
      companyName,
      contactEmail: cleanEmail,
      receiptPrefix: 'PWT'
    });
    console.log(`Initialized default CompanySettings.`);
  }

  // Ensure default Account exists
  let account = await Account.findOne({ ownerId: user._id });
  if (!account) {
    await Account.create({
      ownerId: user._id,
      name: 'Travel Operations Cash',
      type: 'cash',
      balancePaise: 0,
      isDefault: true
    });
    console.log(`Initialized default Account.`);
  }

  console.log('----------------------------------------------------');
  console.log(' TRAVEL COMPANY CREDENTIALS CONFIGURED:');
  console.log(`  Email:    ${cleanEmail}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     ${user.role}`);
  console.log(`  Company:  ${companyName}`);
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

createTravelAdmin().catch((err) => {
  console.error('Error creating travel admin:', err);
  process.exit(1);
});
