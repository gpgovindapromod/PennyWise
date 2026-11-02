const Notification = require('../models/Notification');
const AcademicFee = require('../models/AcademicFee');
const MonthlyBudget = require('../models/MonthlyBudget');
const Transaction = require('../models/Transaction');

// @desc Get live notifications (with dynamic financial trigger evaluation)
const getNotifications = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Evaluate live dynamic alerts for upcoming fees and budget thresholds
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [fees, budget, transactions, userNotifications] = await Promise.all([
      AcademicFee.find({ ownerId, status: { $ne: 'paid' } }),
      MonthlyBudget.findOne({ ownerId, monthKey: currentMonthKey }),
      Transaction.find({ 
        ownerId, 
        type: 'expense', 
        isDeleted: { $ne: true },
        date: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        }
      }),
      Notification.find({ ownerId }).sort({ createdAt: -1 }).limit(15)
    ]);

    const liveAlerts = [];

    // 1. Fee due date checks (< 15 days)
    fees.forEach(fee => {
      const remainingDays = Math.ceil((new Date(fee.dueDate) - now) / (1000 * 60 * 60 * 24));
      if (remainingDays <= 15) {
        const totalPaid = fee.installments?.reduce((s, i) => s + i.amountPaise, 0) || 0;
        const duePaise = fee.totalAmountPaise - totalPaid;
        liveAlerts.push({
          _id: `fee-alert-${fee._id}`,
          title: `Fee Obligation Due: ${fee.title}`,
          message: remainingDays < 0 
            ? `Obligation is overdue by ${Math.abs(remainingDays)} days! Pending: ₹${(duePaise/100).toLocaleString('en-IN')}`
            : `Due in ${remainingDays} days. Pending installment balance: ₹${(duePaise/100).toLocaleString('en-IN')}`,
          type: 'fee',
          read: false,
          link: '/academics',
          createdAt: fee.dueDate
        });
      }
    });

    // 2. Budget burn rate warnings (> 80% ceiling)
    if (budget && budget.limitPaise > 0) {
      const totalSpentPaise = transactions.reduce((sum, t) => sum + t.amountPaise, 0);
      const burnPct = Math.round((totalSpentPaise / budget.limitPaise) * 100);
      if (burnPct >= 80) {
        liveAlerts.push({
          _id: `budget-alert-${currentMonthKey}`,
          title: `Monthly Budget Threshold: ${burnPct}%`,
          message: burnPct >= 100 
            ? `Ceiling breached! Total expenses ₹${(totalSpentPaise/100).toLocaleString('en-IN')} exceeds monthly cap of ₹${(budget.limitPaise/100).toLocaleString('en-IN')}.`
            : `Warning: You have reached ${burnPct}% of your discretionary ceiling for this month.`,
          type: 'budget',
          read: false,
          link: '/goals',
          createdAt: new Date()
        });
      }
    }

    // Combine generated live telemetry alerts with stored notifications
    const allNotifications = [...liveAlerts, ...userNotifications];

    res.json({
      success: true,
      data: {
        notifications: allNotifications,
        unreadCount: allNotifications.filter(n => !n.read).length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark a notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id.startsWith('fee-alert-') || id.startsWith('budget-alert-')) {
      // Dynamic alerts are live-evaluated, return success
      return res.json({ success: true, message: 'Marked as read' });
    }

    await Notification.findOneAndUpdate({ _id: id, ownerId: req.user._id }, { read: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ ownerId: req.user._id }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

