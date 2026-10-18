const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const CompanySettings = require('../src/models/CompanySettings');

async function provisionTravelAdmin() {
  console.log('--- PROVISIONING TRAVEL COMPANY ADMIN ---');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const email = 'govindapromod@gmail.com';
  let user = await User.findOne({ email });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  if (user) {
    console.log(`User ${email} exists. Updating role to travel_admin...`);
    user.role = 'travel_admin';
    user.status = 'active';
    user.companyName = user.companyName || 'PennyWise Tours & Travels';
    user.mustChangePassword = true;
    user.password = hashedPassword;
    await user.save();
    console.log(`Updated user ${user._id} to Travel Company Admin.`);
  } else {
    console.log(`Creating new Travel Company Admin user for ${email}...`);
    user = await User.create({
      name: 'Govind A. Promod',
      email,
      password: hashedPassword,
      role: 'travel_admin',
      companyName: 'PennyWise Tours & Travels',
      status: 'active',
      mustChangePassword: true
    });
    console.log(`Created user ${user._id} with role travel_admin.`);
  }

  // Ensure CompanySettings exist
  let settings = await CompanySettings.findOne({ companyId: user._id });
  if (!settings) {
    settings = await CompanySettings.create({
      companyId: user._id,
      companyName: user.companyName || 'PennyWise Tours & Travels',
      contactEmail: email,
      contactPhone: '+91 98765 43210',
      currency: 'INR',
      receiptPrefix: 'TRV'
    });
    console.log('Created default company settings for travel admin');
  }

  console.log('--- PROVISIONING COMPLETE ---');
  await mongoose.disconnect();
}

provisionTravelAdmin().catch((err) => {
  console.error('Provisioning failed:', err);
  process.exit(1);
});
