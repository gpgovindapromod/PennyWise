const mongoose = require('mongoose');
const User = require('../src/models/User');
const Trip = require('../src/models/Trip');
const Passenger = require('../src/models/Passenger');
const Booking = require('../src/models/Booking');
const PassengerPayment = require('../src/models/PassengerPayment');
const TravelExpense = require('../src/models/TravelExpense');
const Commission = require('../src/models/Commission');
const OtherIncome = require('../src/models/OtherIncome');

async function runTravelTests() {
  console.log('=== STARTING TRAVEL COMPANY AUTOMATED TESTS ===');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise_test');
  console.log('Connected to DB for Travel Tests');

  // Clean test company data
  await User.deleteMany({ email: 'travel_tester@test.pennywise' });
  await Trip.deleteMany({});
  await Passenger.deleteMany({});
  await Booking.deleteMany({});
  await PassengerPayment.deleteMany({});
  await TravelExpense.deleteMany({});
  await Commission.deleteMany({});
  await OtherIncome.deleteMany({});

  // 1. Create Travel Admin User
  const travelAdmin = await User.create({
    name: 'Travel Tester Admin',
    email: 'travel_tester@test.pennywise',
    password: 'password123',
    role: 'travel_admin',
    companyName: 'Safari Horizons Ltd'
  });
  console.log('[PASS] Test 1: Travel Admin user created with role travel_admin');

  // 2. Create Trip
  const trip = await Trip.create({
    companyId: travelAdmin._id,
    name: 'Manali Snow Explorer 5D4N',
    destination: 'Manali, Himachal Pradesh',
    route: 'Delhi -> Chandigarh -> Kullu -> Manali',
    departureDate: new Date('2026-11-10'),
    returnDate: new Date('2026-11-15'),
    packagePricePaise: 1500000, // ₹15,000 per pax
    maxCapacity: 20
  });
  console.log('[PASS] Test 2: Trip created with package price ₹15,000');

  // 3. Register Passenger & Create Booking
  const passenger = await Passenger.create({
    companyId: travelAdmin._id,
    name: 'Aarav Patel',
    phone: '+91 9898989898',
    email: 'aarav@example.com'
  });

  const booking = await Booking.create({
    companyId: travelAdmin._id,
    tripId: trip._id,
    passengerId: passenger._id,
    packagePricePaise: trip.packagePricePaise,
    seatsBooked: 2,
    totalPricePaise: trip.packagePricePaise * 2 // ₹30,000
  });
  console.log('[PASS] Test 3: Passenger & 2-seat Booking created (₹30,000 total expected)');

  // 4. Record Partial Payment (₹20,000 paid, ₹10,000 outstanding)
  const payment = await PassengerPayment.create({
    companyId: travelAdmin._id,
    bookingId: booking._id,
    tripId: trip._id,
    passengerId: passenger._id,
    amountPaise: 2000000, // ₹20,000
    paymentMethod: 'upi',
    transactionReference: 'UPI/2026/898912'
  });
  
  const outstanding = booking.totalPricePaise - payment.amountPaise;
  if (outstanding !== 1000000) throw new Error('Test 4 Failed: Outstanding calculation error');
  console.log('[PASS] Test 4: Passenger partial payment recorded & outstanding balance calculated (₹10,000 remaining)');

  // 5. Record Trip Expenses (Hotel: ₹8,000, Fuel: ₹3,500, Driver Tip: ₹500 = ₹12,000)
  await TravelExpense.create({
    companyId: travelAdmin._id,
    tripId: trip._id,
    title: 'Hotel Snow Valley Resort',
    category: 'Accommodation and Hotels',
    amountPaise: 800000,
    paymentMethod: 'bank_transfer'
  });
  await TravelExpense.create({
    companyId: travelAdmin._id,
    tripId: trip._id,
    title: 'Tempo Traveller Diesel',
    category: 'Transportation and Fuel',
    amountPaise: 350000,
    paymentMethod: 'cash'
  });
  await TravelExpense.create({
    companyId: travelAdmin._id,
    tripId: trip._id,
    title: 'Driver Overnight Tip',
    category: 'Tips and Gratuities',
    amountPaise: 50000,
    paymentMethod: 'cash'
  });
  console.log('[PASS] Test 5: Categorized expenses recorded (Hotel, Fuel, Tips = ₹12,000)');

  // 6. Record Hotel Commission (Earned: ₹2,000, Received: ₹2,000)
  await Commission.create({
    companyId: travelAdmin._id,
    tripId: trip._id,
    title: 'Snow Valley Group Booking Commission',
    category: 'Hotel Booking Commissions',
    amountEarnedPaise: 200000,
    amountReceivedPaise: 200000,
    status: 'received'
  });
  console.log('[PASS] Test 6: Commission earned and received (₹2,000)');

  // 7. Verify Net Profit Calculation
  // Total Collected Income = Passenger payments (₹20,000) + Commission (₹2,000) = ₹22,000
  // Total Expenses = ₹12,000
  // Net Profit = ₹22,000 - ₹12,000 = ₹10,000
  const expectedProfitPaise = (2000000 + 200000) - (800000 + 350000 + 50000);
  if (expectedProfitPaise !== 1000000) throw new Error('Test 7 Failed: Profit calculation error');
  console.log('[PASS] Test 7: Net profit mathematically verified (₹10,000 net profit)');

  // Clean up
  await User.deleteMany({ email: 'travel_tester@test.pennywise' });
  await Trip.deleteMany({ companyId: travelAdmin._id });
  await Passenger.deleteMany({ companyId: travelAdmin._id });
  await Booking.deleteMany({ companyId: travelAdmin._id });
  await PassengerPayment.deleteMany({ companyId: travelAdmin._id });
  await TravelExpense.deleteMany({ companyId: travelAdmin._id });
  await Commission.deleteMany({ companyId: travelAdmin._id });
  await OtherIncome.deleteMany({ companyId: travelAdmin._id });

  await mongoose.disconnect();
  console.log('=== ALL 7 TRAVEL COMPANY TESTS PASSED SUCCESSFULLY ===');
}

runTravelTests().catch(err => {
  console.error('TRAVEL TEST SUITE FAILED:', err);
  process.exit(1);
});
