const express = require('express');
const router = express.Router();
const travelCtrl = require('../controllers/travelController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');

// All travel routes require authentication and travel_admin or admin role
router.use(protect);
router.use(authorizeRoles('travel_admin', 'admin'));

// 1. Dashboard Summary & Analytics
router.get('/dashboard', travelCtrl.getDashboardSummary);

// 2. Trips CRUD
router.route('/trips')
  .get(travelCtrl.getTrips)
  .post(travelCtrl.createTrip);

router.route('/trips/:id')
  .get(travelCtrl.getTripById)
  .put(travelCtrl.updateTrip)
  .delete(travelCtrl.deleteTrip);

// 3. Passengers & Bookings
router.route('/passengers')
  .get(travelCtrl.getPassengers)
  .post(travelCtrl.createPassenger);

router.route('/passengers/:id')
  .put(travelCtrl.updatePassenger)
  .delete(travelCtrl.deletePassenger);

router.post('/bookings', travelCtrl.createBooking);

// 4. Passenger Payments & Refunds
router.route('/payments')
  .get(travelCtrl.getPayments)
  .post(travelCtrl.recordPayment);

// 5. Expenses CRUD
router.route('/expenses')
  .get(travelCtrl.getExpenses)
  .post(travelCtrl.createExpense);

router.route('/expenses/:id')
  .put(travelCtrl.updateExpense)
  .delete(travelCtrl.deleteExpense);

// 6. Commissions CRUD
router.route('/commissions')
  .get(travelCtrl.getCommissions)
  .post(travelCtrl.createCommission);

router.route('/commissions/:id')
  .put(travelCtrl.updateCommission)
  .delete(travelCtrl.deleteCommission);

// 7. Other Income CRUD
router.route('/other-income')
  .get(travelCtrl.getOtherIncomes)
  .post(travelCtrl.createOtherIncome);

// 8. Unified Financial Transactions
router.get('/transactions', travelCtrl.getUnifiedTransactions);

// 9. Company Settings
router.route('/settings')
  .get(travelCtrl.getSettings)
  .put(travelCtrl.updateSettings);

module.exports = router;
