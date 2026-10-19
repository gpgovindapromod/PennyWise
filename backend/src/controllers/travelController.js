const Trip = require('../models/Trip');
const Passenger = require('../models/Passenger');
const Booking = require('../models/Booking');
const PassengerPayment = require('../models/PassengerPayment');
const TravelExpense = require('../models/TravelExpense');
const Commission = require('../models/Commission');
const OtherIncome = require('../models/OtherIncome');
const CompanySettings = require('../models/CompanySettings');

// Helper to get companyId from req.user
const getCompanyId = (req) => req.user._id;

// ==========================================
// 1. DASHBOARD & FINANCIAL ANALYTICS
// ==========================================
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { startDate, endDate, tripId } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    // Trip filter query helper
    const tripFilter = tripId ? { tripId } : {};

    // 1. Trips metrics
    const allTrips = await Trip.find({ companyId });
    const totalTrips = allTrips.length;
    const upcomingTrips = allTrips.filter(t => t.status === 'upcoming').length;
    const ongoingTrips = allTrips.filter(t => t.status === 'ongoing').length;
    const completedTrips = allTrips.filter(t => t.status === 'completed').length;

    // 2. Passengers metrics
    const totalPassengers = await Passenger.countDocuments({ companyId });

    // 3. Bookings & Expected Income
    const bookings = await Booking.find({ companyId, ...tripFilter, status: { $ne: 'cancelled' } });
    const expectedPassengerIncomePaise = bookings.reduce((sum, b) => sum + (b.totalPricePaise || 0), 0);

    // 4. Passenger Payments Collected & Refunds
    const paymentQuery = { companyId, ...tripFilter };
    if (startDate || endDate) paymentQuery.paymentDate = dateFilter;
    const payments = await PassengerPayment.find(paymentQuery);

    let passengerPaymentsReceivedPaise = 0;
    let passengerRefundsPaidPaise = 0;
    payments.forEach(p => {
      if (p.type === 'refund') {
        passengerRefundsPaidPaise += p.amountPaise;
      } else {
        passengerPaymentsReceivedPaise += p.amountPaise;
      }
    });
    const netPassengerIncomeCollectedPaise = passengerPaymentsReceivedPaise - passengerRefundsPaidPaise;

    // Outstanding Passenger Payments (Receivables)
    // Calculate booking-by-booking
    const allActiveBookings = await Booking.find({ companyId, status: { $ne: 'cancelled' } });
    const allPaymentsForCo = await PassengerPayment.find({ companyId });
    
    let totalOutstandingPassengerPaise = 0;
    allActiveBookings.forEach(booking => {
      const bPayments = allPaymentsForCo.filter(p => p.bookingId && p.bookingId.toString() === booking._id.toString());
      const paid = bPayments.reduce((sum, p) => p.type === 'refund' ? sum - p.amountPaise : sum + p.amountPaise, 0);
      const balance = (booking.totalPricePaise || 0) - paid;
      if (balance > 0) totalOutstandingPassengerPaise += balance;
    });

    // 5. Commissions
    const commQuery = { companyId, ...tripFilter };
    if (startDate || endDate) commQuery.dateEarned = dateFilter;
    const commissions = await Commission.find(commQuery);

    const totalCommissionsEarnedPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountEarnedPaise || 0), 0);
    const totalCommissionsReceivedPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountReceivedPaise || 0), 0);
    const outstandingCommissionsPaise = Math.max(0, totalCommissionsEarnedPaise - totalCommissionsReceivedPaise);

    // 6. Other Income
    const otherQuery = { companyId, ...tripFilter };
    if (startDate || endDate) otherQuery.dateEarned = dateFilter;
    const otherIncomes = await OtherIncome.find(otherQuery);

    const totalOtherIncomeEarnedPaise = otherIncomes.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.amountEarnedPaise || 0), 0);
    const totalOtherIncomeReceivedPaise = otherIncomes.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.amountReceivedPaise || 0), 0);

    // 7. Expenses
    const expQuery = { companyId, ...tripFilter };
    if (startDate || endDate) expQuery.expenseDate = dateFilter;
    const expenses = await TravelExpense.find(expQuery);
    const totalExpensesPaise = expenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);

    // 8. Totals and Net Profit Calculations
    // Total Collected Income = Net Passenger Payments Collected + Commissions Received + Other Income Received
    const totalIncomeCollectedPaise = netPassengerIncomeCollectedPaise + totalCommissionsReceivedPaise + totalOtherIncomeReceivedPaise;
    const totalNetProfitPaise = totalIncomeCollectedPaise - totalExpensesPaise;
    const averageProfitPerTripPaise = totalTrips > 0 ? Math.round(totalNetProfitPaise / totalTrips) : 0;

    // 9. Category Breakdown for Expenses
    const expenseCategoryMap = {};
    expenses.forEach(e => {
      expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + e.amountPaise;
    });
    const expenseCategoryBreakdown = Object.keys(expenseCategoryMap).map(category => ({
      category,
      amountRupees: expenseCategoryMap[category] / 100
    })).sort((a, b) => b.amountRupees - a.amountRupees);

    // 10. Recent Transactions Feed
    // Compile unified transactions list (recent payments, expenses, commissions, other income)
    const recentExpenses = expenses.slice(-6).map(e => ({
      id: e._id,
      date: e.expenseDate,
      type: 'expense',
      category: e.category,
      title: e.title,
      amountRupees: -(e.amountPaise / 100),
      paymentMethod: e.paymentMethod
    }));

    const recentPayments = payments.slice(-6).map(p => ({
      id: p._id,
      date: p.paymentDate,
      type: p.type === 'refund' ? 'refund' : 'passenger_payment',
      category: 'Passenger Booking',
      title: p.type === 'refund' ? 'Passenger Refund' : 'Passenger Payment Received',
      amountRupees: p.type === 'refund' ? -(p.amountPaise / 100) : (p.amountPaise / 100),
      paymentMethod: p.paymentMethod
    }));

    const recentTransactions = [...recentExpenses, ...recentPayments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    // 11. Trip Profitability Summary
    const tripProfitability = allTrips.map(trip => {
      const tripBookings = allActiveBookings.filter(b => b.tripId.toString() === trip._id.toString());
      const tripPayments = allPaymentsForCo.filter(p => p.tripId && p.tripId.toString() === trip._id.toString());
      const tripExp = expenses.filter(e => e.tripId && e.tripId.toString() === trip._id.toString());
      const tripComm = commissions.filter(c => c.tripId && c.tripId.toString() === trip._id.toString() && c.status !== 'cancelled');

      const collectedPaxPaise = tripPayments.reduce((sum, p) => p.type === 'refund' ? sum - p.amountPaise : sum + p.amountPaise, 0);
      const commReceivedPaise = tripComm.reduce((sum, c) => sum + (c.amountReceivedPaise || 0), 0);
      const totalIncomePaise = collectedPaxPaise + commReceivedPaise;
      const totalExpPaise = tripExp.reduce((sum, e) => sum + (e.amountPaise || 0), 0);
      const netProfitPaise = totalIncomePaise - totalExpPaise;

      return {
        tripId: trip._id,
        tripName: trip.name,
        destination: trip.destination,
        status: trip.status,
        passengerCount: tripBookings.length,
        incomeRupees: totalIncomePaise / 100,
        expenseRupees: totalExpPaise / 100,
        netProfitRupees: netProfitPaise / 100
      };
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalIncomeCollectedRupees: totalIncomeCollectedPaise / 100,
          totalExpensesRupees: totalExpensesPaise / 100,
          totalCommissionsReceivedRupees: totalCommissionsReceivedPaise / 100,
          totalCommissionsEarnedRupees: totalCommissionsEarnedPaise / 100,
          totalNetProfitRupees: totalNetProfitPaise / 100,
          outstandingPassengerPaymentsRupees: totalOutstandingPassengerPaise / 100,
          outstandingCommissionsRupees: outstandingCommissionsPaise / 100,
          totalTrips,
          upcomingTrips,
          ongoingTrips,
          completedTrips,
          totalPassengers,
          averageProfitPerTripRupees: averageProfitPerTripPaise / 100
        },
        expenseCategoryBreakdown,
        recentTransactions,
        tripProfitability
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. TRIPS CRUD
// ==========================================
exports.getTrips = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { status, search, sortBy = 'departureDate', sortOrder = 'asc' } = req.query;

    const query = { companyId };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { route: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const trips = await Trip.find(query).sort(sort);

    // Compute financial and passenger stats for each trip
    const tripsWithStats = await Promise.all(trips.map(async (trip) => {
      const bookings = await Booking.find({ tripId: trip._id, status: { $ne: 'cancelled' } }).populate('passengerId', 'name phone email');
      const payments = await PassengerPayment.find({ tripId: trip._id });
      const expenses = await TravelExpense.find({ tripId: trip._id });
      const commissions = await Commission.find({ tripId: trip._id, status: { $ne: 'cancelled' } });

      const expectedPassengerIncomePaise = bookings.reduce((sum, b) => sum + (b.totalPricePaise || 0), 0);
      const collectedPassengerPaymentsPaise = payments.reduce((sum, p) => p.type === 'refund' ? sum - p.amountPaise : sum + p.amountPaise, 0);
      const outstandingPaymentsPaise = Math.max(0, expectedPassengerIncomePaise - collectedPassengerPaymentsPaise);
      const totalExpensesPaise = expenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);
      const totalCommissionsPaise = commissions.reduce((sum, c) => sum + (c.amountReceivedPaise || 0), 0);
      const netProfitPaise = (collectedPassengerPaymentsPaise + totalCommissionsPaise) - totalExpensesPaise;

      return {
        ...trip.toObject(),
        passengerCount: bookings.length,
        bookings,
        expectedPassengerIncomePaise,
        collectedPassengerPaymentsPaise,
        outstandingPaymentsPaise,
        totalExpensesPaise,
        totalCommissionsPaise,
        netProfitPaise
      };
    }));

    res.json({ success: true, data: tripsWithStats });
  } catch (err) {
    next(err);
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const trip = await Trip.findOne({ _id: req.params.id, companyId });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const bookings = await Booking.find({ tripId: trip._id }).populate('passengerId');
    const payments = await PassengerPayment.find({ tripId: trip._id }).sort({ paymentDate: -1 });
    const expenses = await TravelExpense.find({ tripId: trip._id }).sort({ expenseDate: -1 });
    const commissions = await Commission.find({ tripId: trip._id }).sort({ dateEarned: -1 });

    const expectedPassengerIncomePaise = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.totalPricePaise || 0), 0);
    const collectedPassengerPaymentsPaise = payments.reduce((sum, p) => p.type === 'refund' ? sum - p.amountPaise : sum + p.amountPaise, 0);
    const outstandingPaymentsPaise = Math.max(0, expectedPassengerIncomePaise - collectedPassengerPaymentsPaise);
    const totalExpensesPaise = expenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);
    const totalCommissionsPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountReceivedPaise || 0), 0);
    const netProfitPaise = (collectedPassengerPaymentsPaise + totalCommissionsPaise) - totalExpensesPaise;

    res.json({
      success: true,
      data: {
        trip,
        bookings,
        payments,
        expenses,
        commissions,
        financialOverview: {
          expectedPassengerIncomeRupees: expectedPassengerIncomePaise / 100,
          collectedPassengerPaymentsRupees: collectedPassengerPaymentsPaise / 100,
          outstandingPaymentsRupees: outstandingPaymentsPaise / 100,
          totalExpensesRupees: totalExpensesPaise / 100,
          totalCommissionsRupees: totalCommissionsPaise / 100,
          netProfitRupees: netProfitPaise / 100
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createTrip = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const {
      name,
      destination,
      route,
      departureDate,
      returnDate,
      packageDescription,
      packagePricePaise,
      packagePriceAdultPaise,
      packagePriceChildPaise,
      capacity,
      maxCapacity,
      notes
    } = req.body;

    if (!name || !destination || !departureDate || !returnDate) {
      return res.status(400).json({ success: false, message: 'Name, destination, departure and return dates are required' });
    }

    const adultPaise = packagePriceAdultPaise !== undefined ? parseInt(packagePriceAdultPaise, 10) : (parseInt(packagePricePaise, 10) || 0);
    const childPaise = packagePriceChildPaise !== undefined ? parseInt(packagePriceChildPaise, 10) : 0;
    const finalCapacity = parseInt(capacity, 10) || parseInt(maxCapacity, 10) || 30;

    const trip = await Trip.create({
      companyId,
      name: name.trim(),
      destination: destination.trim(),
      route: route ? route.trim() : '',
      departureDate,
      returnDate,
      packageDescription: packageDescription ? packageDescription.trim() : '',
      packagePricePaise: adultPaise,
      packagePriceAdultPaise: adultPaise,
      packagePriceChildPaise: childPaise,
      capacity: finalCapacity,
      maxCapacity: finalCapacity,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const trip = await Trip.findOne({ _id: req.params.id, companyId });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const updates = req.body;
    if (updates.capacity !== undefined) {
      updates.maxCapacity = parseInt(updates.capacity, 10) || 30;
      updates.capacity = updates.maxCapacity;
    } else if (updates.maxCapacity !== undefined) {
      updates.capacity = parseInt(updates.maxCapacity, 10) || 30;
    }

    if (updates.packagePriceAdultPaise !== undefined) {
      updates.packagePricePaise = parseInt(updates.packagePriceAdultPaise, 10) || 0;
    }

    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'companyId') {
        trip[key] = updates[key];
      }
    });

    await trip.save();
    res.json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const trip = await Trip.findOne({ _id: req.params.id, companyId });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Check if trip has financial history
    const hasPayments = await PassengerPayment.exists({ tripId: trip._id });
    const hasExpenses = await TravelExpense.exists({ tripId: trip._id });

    if (hasPayments || hasExpenses) {
      // Set to cancelled to preserve audit trail
      trip.status = 'cancelled';
      trip.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
      await trip.save();
      return res.json({ success: true, message: 'Trip has financial history; marked as Cancelled to preserve ledger records', data: trip });
    }

    await Booking.deleteMany({ tripId: trip._id });
    await trip.deleteOne();
    res.json({ success: true, message: 'Trip removed successfully' });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. PASSENGERS & BOOKINGS
// ==========================================
exports.getPassengers = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { search } = req.query;

    const query = { companyId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const passengers = await Passenger.find(query).sort({ createdAt: -1 });

    // Attach bookings and payment summaries
    const passengersWithData = await Promise.all(passengers.map(async (p) => {
      const bookings = await Booking.find({ passengerId: p._id }).populate('tripId', 'name destination departureDate status');
      const payments = await PassengerPayment.find({ passengerId: p._id });

      const totalBookedPaise = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.totalPricePaise || 0), 0);
      const totalPaidPaise = payments.reduce((sum, pay) => pay.type === 'refund' ? sum - pay.amountPaise : sum + pay.amountPaise, 0);
      const balancePaise = Math.max(0, totalBookedPaise - totalPaidPaise);

      return {
        ...p.toObject(),
        bookings,
        totalBookedPaise,
        totalPaidPaise,
        balancePaise,
        paymentStatus: balancePaise === 0 && totalBookedPaise > 0 ? 'paid' : (totalPaidPaise > 0 ? 'partially_paid' : 'pending')
      };
    }));

    res.json({ success: true, data: passengersWithData });
  } catch (err) {
    next(err);
  }
};

exports.createPassenger = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const {
      name,
      phone,
      email,
      address,
      notes,
      tripId,
      packagePricePaise,
      packagePriceAdultPaise,
      packagePriceChildPaise,
      seatsBooked,
      adultSeats,
      childSeats
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Passenger name and phone are required' });
    }

    const passenger = await Passenger.create({
      companyId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      notes: notes ? notes.trim() : ''
    });

    // Optional booking creation if tripId is provided
    let booking = null;
    if (tripId) {
      const trip = await Trip.findOne({ _id: tripId, companyId });
      if (trip) {
        const aSeats = adultSeats !== undefined ? parseInt(adultSeats, 10) : (seatsBooked !== undefined ? parseInt(seatsBooked, 10) : 1);
        const cSeats = childSeats !== undefined ? parseInt(childSeats, 10) : 0;
        const totalSeats = aSeats + cSeats;

        const aPrice = packagePriceAdultPaise !== undefined
          ? parseInt(packagePriceAdultPaise, 10)
          : (trip.packagePriceAdultPaise || (packagePricePaise !== undefined ? parseInt(packagePricePaise, 10) : trip.packagePricePaise));
        const cPrice = packagePriceChildPaise !== undefined
          ? parseInt(packagePriceChildPaise, 10)
          : (trip.packagePriceChildPaise !== undefined ? trip.packagePriceChildPaise : 0);

        const total = (aSeats * aPrice) + (cSeats * cPrice);

        booking = await Booking.create({
          companyId,
          tripId: trip._id,
          passengerId: passenger._id,
          adultSeats: aSeats,
          childSeats: cSeats,
          seatsBooked: totalSeats > 0 ? totalSeats : 1,
          packagePriceAdultPaise: aPrice,
          packagePriceChildPaise: cPrice,
          packagePricePaise: aPrice,
          totalPricePaise: total
        });
      }
    }

    res.status(201).json({ success: true, data: { passenger, booking } });
  } catch (err) {
    next(err);
  }
};

exports.updatePassenger = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const passenger = await Passenger.findOne({ _id: req.params.id, companyId });
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });

    const { name, phone, email, address, notes } = req.body;
    if (name) passenger.name = name.trim();
    if (phone) passenger.phone = phone.trim();
    if (email !== undefined) passenger.email = email.trim();
    if (address !== undefined) passenger.address = address.trim();
    if (notes !== undefined) passenger.notes = notes.trim();

    await passenger.save();
    res.json({ success: true, data: passenger });
  } catch (err) {
    next(err);
  }
};

exports.deletePassenger = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const passenger = await Passenger.findOne({ _id: req.params.id, companyId });
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });

    const hasPayments = await PassengerPayment.exists({ passengerId: passenger._id });
    if (hasPayments) {
      return res.status(400).json({ success: false, message: 'Cannot delete passenger with payment history. Cancel their bookings instead.' });
    }

    await Booking.deleteMany({ passengerId: passenger._id });
    await passenger.deleteOne();
    res.json({ success: true, message: 'Passenger record removed' });
  } catch (err) {
    next(err);
  }
};

// Bookings
exports.createBooking = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const {
      tripId,
      passengerId,
      packagePricePaise,
      packagePriceAdultPaise,
      packagePriceChildPaise,
      seatsBooked,
      adultSeats,
      childSeats,
      notes
    } = req.body;

    const trip = await Trip.findOne({ _id: tripId, companyId });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const passenger = await Passenger.findOne({ _id: passengerId, companyId });
    if (!passenger) return res.status(404).json({ success: false, message: 'Passenger not found' });

    const aSeats = adultSeats !== undefined ? parseInt(adultSeats, 10) : (seatsBooked !== undefined ? parseInt(seatsBooked, 10) : 1);
    const cSeats = childSeats !== undefined ? parseInt(childSeats, 10) : 0;
    const totalSeats = aSeats + cSeats;

    const aPrice = packagePriceAdultPaise !== undefined
      ? parseInt(packagePriceAdultPaise, 10)
      : (trip.packagePriceAdultPaise || (packagePricePaise !== undefined ? parseInt(packagePricePaise, 10) : trip.packagePricePaise));
    const cPrice = packagePriceChildPaise !== undefined
      ? parseInt(packagePriceChildPaise, 10)
      : (trip.packagePriceChildPaise !== undefined ? trip.packagePriceChildPaise : 0);

    const total = (aSeats * aPrice) + (cSeats * cPrice);

    const booking = await Booking.create({
      companyId,
      tripId: trip._id,
      passengerId: passenger._id,
      adultSeats: aSeats,
      childSeats: cSeats,
      seatsBooked: totalSeats > 0 ? totalSeats : 1,
      packagePriceAdultPaise: aPrice,
      packagePriceChildPaise: cPrice,
      packagePricePaise: aPrice,
      totalPricePaise: total,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. PASSENGER PAYMENTS & REFUNDS
// ==========================================
exports.getPayments = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { tripId, passengerId, status, type } = req.query;

    const query = { companyId };
    if (tripId) query.tripId = tripId;
    if (passengerId) query.passengerId = passengerId;
    if (type) query.type = type;

    const payments = await PassengerPayment.find(query)
      .populate('passengerId', 'name phone email')
      .populate('tripId', 'name destination')
      .sort({ paymentDate: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { bookingId, tripId, passengerId, amountPaise, paymentMethod, transactionReference, paymentDate, notes, type = 'payment' } = req.body;

    if (!amountPaise || parseInt(amountPaise, 10) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    if (!passengerId || !tripId) {
      return res.status(400).json({ success: false, message: 'Passenger and Trip IDs are required' });
    }

    const payment = await PassengerPayment.create({
      companyId,
      bookingId: bookingId || null,
      tripId,
      passengerId,
      amountPaise: parseInt(amountPaise, 10),
      paymentMethod: paymentMethod || 'upi',
      transactionReference: transactionReference || '',
      paymentDate: paymentDate || new Date(),
      type,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 5. EXPENSES CRUD
// ==========================================
exports.getExpenses = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { tripId, category, search, startDate, endDate } = req.query;

    const query = { companyId };
    if (tripId && tripId !== 'all') query.tripId = tripId;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.expenseDate.$lte = e;
      }
    }

    const expenses = await TravelExpense.find(query)
      .populate('tripId', 'name destination departureDate returnDate')
      .sort({ expenseDate: -1 });

    const totalPaise = expenses.reduce((sum, e) => sum + (e.amountPaise || 0), 0);

    res.json({
      success: true,
      data: {
        expenses,
        totalRupees: totalPaise / 100
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { title, category, amountPaise, tripId, expenseDate, vendor, paymentMethod, transactionReference, description } = req.body;

    if (!title || !category || !amountPaise) {
      return res.status(400).json({ success: false, message: 'Title, category and amount are required' });
    }

    const expense = await TravelExpense.create({
      companyId,
      tripId: tripId || null,
      title: title.trim(),
      category: category.trim(),
      amountPaise: parseInt(amountPaise, 10),
      expenseDate: expenseDate || new Date(),
      vendor: vendor ? vendor.trim() : '',
      paymentMethod: paymentMethod || 'cash',
      transactionReference: transactionReference ? transactionReference.trim() : '',
      description: description ? description.trim() : ''
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const expense = await TravelExpense.findOne({ _id: req.params.id, companyId });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense record not found' });

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'companyId') {
        expense[key] = updates[key];
      }
    });

    await expense.save();
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const expense = await TravelExpense.findOneAndDelete({ _id: req.params.id, companyId });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense record not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 6. COMMISSIONS CRUD
// ==========================================
exports.getCommissions = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { tripId, category, status } = req.query;

    const query = { companyId };
    if (tripId && tripId !== 'all') query.tripId = tripId;
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;

    const commissions = await Commission.find(query)
      .populate('tripId', 'name destination')
      .sort({ dateEarned: -1 });

    const totalEarnedPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountEarnedPaise || 0), 0);
    const totalReceivedPaise = commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + (c.amountReceivedPaise || 0), 0);
    const outstandingPaise = Math.max(0, totalEarnedPaise - totalReceivedPaise);

    res.json({
      success: true,
      data: {
        commissions,
        totalEarnedRupees: totalEarnedPaise / 100,
        totalReceivedRupees: totalReceivedPaise / 100,
        outstandingRupees: outstandingPaise / 100
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createCommission = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { title, category, tripId, amountEarnedPaise, amountReceivedPaise, dateEarned, dateReceived, paymentMethod, transactionReference, status, notes } = req.body;

    if (!title || !category || amountEarnedPaise === undefined) {
      return res.status(400).json({ success: false, message: 'Title, category, and earned amount are required' });
    }

    const earned = parseInt(amountEarnedPaise, 10);
    const received = amountReceivedPaise !== undefined ? parseInt(amountReceivedPaise, 10) : 0;
    
    let commStatus = status;
    if (!commStatus) {
      if (received >= earned && earned > 0) commStatus = 'received';
      else if (received > 0) commStatus = 'partially_received';
      else commStatus = 'pending';
    }

    const commission = await Commission.create({
      companyId,
      tripId: tripId || null,
      title: title.trim(),
      category: category.trim(),
      amountEarnedPaise: earned,
      amountReceivedPaise: received,
      dateEarned: dateEarned || new Date(),
      dateReceived: received > 0 ? (dateReceived || new Date()) : null,
      paymentMethod: paymentMethod || 'bank_transfer',
      transactionReference: transactionReference || '',
      status: commStatus,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: commission });
  } catch (err) {
    next(err);
  }
};

exports.updateCommission = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const commission = await Commission.findOne({ _id: req.params.id, companyId });
    if (!commission) return res.status(404).json({ success: false, message: 'Commission record not found' });

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'companyId') {
        commission[key] = updates[key];
      }
    });

    // Auto-adjust status if amounts updated
    if (commission.amountReceivedPaise >= commission.amountEarnedPaise && commission.amountEarnedPaise > 0) {
      commission.status = 'received';
    } else if (commission.amountReceivedPaise > 0) {
      commission.status = 'partially_received';
    }

    await commission.save();
    res.json({ success: true, data: commission });
  } catch (err) {
    next(err);
  }
};

exports.deleteCommission = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const commission = await Commission.findOneAndDelete({ _id: req.params.id, companyId });
    if (!commission) return res.status(404).json({ success: false, message: 'Commission not found' });
    res.json({ success: true, message: 'Commission deleted' });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 7. OTHER INCOME CRUD
// ==========================================
exports.getOtherIncomes = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const otherIncomes = await OtherIncome.find({ companyId })
      .populate('tripId', 'name destination')
      .sort({ dateEarned: -1 });

    const totalEarnedPaise = otherIncomes.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.amountEarnedPaise || 0), 0);
    const totalReceivedPaise = otherIncomes.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.amountReceivedPaise || 0), 0);

    res.json({
      success: true,
      data: {
        otherIncomes,
        totalEarnedRupees: totalEarnedPaise / 100,
        totalReceivedRupees: totalReceivedPaise / 100
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createOtherIncome = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { title, category, tripId, amountEarnedPaise, amountReceivedPaise, dateEarned, paymentMethod, transactionReference, status, notes } = req.body;

    if (!title || !category || amountEarnedPaise === undefined) {
      return res.status(400).json({ success: false, message: 'Title, category, and earned amount are required' });
    }

    const earned = parseInt(amountEarnedPaise, 10);
    const received = amountReceivedPaise !== undefined ? parseInt(amountReceivedPaise, 10) : earned;

    const record = await OtherIncome.create({
      companyId,
      tripId: tripId || null,
      title: title.trim(),
      category: category.trim(),
      amountEarnedPaise: earned,
      amountReceivedPaise: received,
      dateEarned: dateEarned || new Date(),
      paymentMethod: paymentMethod || 'upi',
      transactionReference: transactionReference || '',
      status: status || 'received',
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 8. UNIFIED FINANCIAL TRANSACTIONS LEDGER
// ==========================================
exports.getUnifiedTransactions = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    const { paymentMethod, tripId, type } = req.query;

    const pQuery = { companyId };
    const eQuery = { companyId };
    const cQuery = { companyId, status: { $ne: 'cancelled' } };
    const oQuery = { companyId, status: { $ne: 'cancelled' } };

    if (tripId && tripId !== 'all') {
      pQuery.tripId = tripId;
      eQuery.tripId = tripId;
      cQuery.tripId = tripId;
      oQuery.tripId = tripId;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      pQuery.paymentMethod = paymentMethod;
      eQuery.paymentMethod = paymentMethod;
      cQuery.paymentMethod = paymentMethod;
      oQuery.paymentMethod = paymentMethod;
    }

    const [payments, expenses, commissions, otherIncomes] = await Promise.all([
      PassengerPayment.find(pQuery).populate('tripId', 'name destination').populate('passengerId', 'name phone'),
      TravelExpense.find(eQuery).populate('tripId', 'name destination'),
      Commission.find(cQuery).populate('tripId', 'name destination'),
      OtherIncome.find(oQuery).populate('tripId', 'name destination')
    ]);

    const txList = [];

    // 1. Passenger payments and refunds
    payments.forEach(p => {
      const isRefund = p.type === 'refund';
      txList.push({
        id: p._id,
        date: p.paymentDate,
        transactionType: isRefund ? 'Passenger Refund' : 'Passenger Payment',
        flow: isRefund ? 'outflow' : 'inflow',
        description: `${isRefund ? 'Refund to' : 'Payment from'} ${p.passengerId?.name || 'Passenger'}`,
        tripName: p.tripId?.name || 'General / Multi-trip',
        amountRupees: (p.amountPaise / 100) * (isRefund ? -1 : 1),
        paymentMethod: p.paymentMethod,
        reference: p.transactionReference || 'N/A',
        status: 'confirmed'
      });
    });

    // 2. Expenses
    expenses.forEach(e => {
      txList.push({
        id: e._id,
        date: e.expenseDate,
        transactionType: `Expense: ${e.category}`,
        flow: 'outflow',
        description: e.title,
        tripName: e.tripId?.name || 'Company Overhead',
        amountRupees: -(e.amountPaise / 100),
        paymentMethod: e.paymentMethod,
        reference: e.transactionReference || 'N/A',
        status: 'confirmed'
      });
    });

    // 3. Commissions received
    commissions.filter(c => c.amountReceivedPaise > 0).forEach(c => {
      txList.push({
        id: c._id,
        date: c.dateReceived || c.dateEarned,
        transactionType: `Commission: ${c.category}`,
        flow: 'inflow',
        description: c.title,
        tripName: c.tripId?.name || 'Affiliate / General',
        amountRupees: (c.amountReceivedPaise / 100),
        paymentMethod: c.paymentMethod,
        reference: c.transactionReference || 'N/A',
        status: 'confirmed'
      });
    });

    // 4. Other income received
    otherIncomes.filter(o => o.amountReceivedPaise > 0).forEach(o => {
      txList.push({
        id: o._id,
        date: o.dateReceived || o.dateEarned,
        transactionType: `Other Income: ${o.category}`,
        flow: 'inflow',
        description: o.title,
        tripName: o.tripId?.name || 'General',
        amountRupees: (o.amountReceivedPaise / 100),
        paymentMethod: o.paymentMethod,
        reference: o.transactionReference || 'N/A',
        status: 'confirmed'
      });
    });

    // Filter by type if provided (inflow / outflow)
    let filteredList = txList;
    if (type && type !== 'all') {
      filteredList = txList.filter(t => t.flow === type);
    }

    filteredList.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: filteredList });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 9. COMPANY SETTINGS
// ==========================================
exports.getSettings = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    let settings = await CompanySettings.findOne({ companyId });
    if (!settings) {
      settings = await CompanySettings.create({
        companyId,
        companyName: req.user.companyName || 'PennyWise Tours & Travels',
        contactEmail: req.user.email
      });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const companyId = getCompanyId(req);
    let settings = await CompanySettings.findOne({ companyId });
    if (!settings) {
      settings = new CompanySettings({ companyId });
    }

    const { companyName, contactEmail, contactPhone, address, currency, receiptPrefix, customExpenseCategories, customCommissionCategories, customOtherIncomeCategories } = req.body;

    if (companyName) {
      settings.companyName = companyName.trim();
      await User.findByIdAndUpdate(companyId, { companyName: companyName.trim() });
    }
    if (contactEmail !== undefined) settings.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) settings.contactPhone = contactPhone.trim();
    if (address !== undefined) settings.address = address.trim();
    if (currency) settings.currency = currency;
    if (receiptPrefix) settings.receiptPrefix = receiptPrefix.trim();
    if (Array.isArray(customExpenseCategories)) settings.customExpenseCategories = customExpenseCategories;
    if (Array.isArray(customCommissionCategories)) settings.customCommissionCategories = customCommissionCategories;
    if (Array.isArray(customOtherIncomeCategories)) settings.customOtherIncomeCategories = customOtherIncomeCategories;

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};
