const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');

// Directional outflow types
const OUTFLOW = new Set(['expense', 'transfer_out', 'transfer']);

/**
 * Diagnostic Financial Reconciliation Engine
 * 
 * Performs read-only verification across all accounts, ledger entries,
 * goal vaults, refunds, and transfers without mutating financial records.
 * 
 * @param {string|mongoose.Types.ObjectId} ownerId - Target user ID
 * @returns {Promise<Object>} Detailed reconciliation diagnostic report
 */
async function generateFinancialReconciliationReport(ownerId) {
  const userObjectId = new mongoose.Types.ObjectId(ownerId);

  // 1. Fetch user accounts
  const accounts = await Account.find({ ownerId: userObjectId }).lean();

  // 2. Aggregate active transaction deltas grouped by account and type
  const ledgerDeltas = await Transaction.aggregate([
    {
      $match: {
        ownerId: userObjectId,
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: { accountId: '$accountId', type: '$type' },
        totalPaise: { $sum: '$amountPaise' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Build net ledger delta map per account
  const accountNetDeltas = {};
  const accountTypeStats = {};

  ledgerDeltas.forEach((d) => {
    const accIdStr = d._id.accountId ? d._id.accountId.toString() : 'unknown';
    if (!accountNetDeltas[accIdStr]) accountNetDeltas[accIdStr] = 0;
    if (!accountTypeStats[accIdStr]) accountTypeStats[accIdStr] = {};

    accountTypeStats[accIdStr][d._id.type] = {
      totalPaise: d.totalPaise,
      count: d.count
    };

    const amt = d.totalPaise || 0;
    if (d._id.type === 'income' || d._id.type === 'transfer_in' || d._id.type === 'refund') {
      accountNetDeltas[accIdStr] += amt;
    } else if (OUTFLOW.has(d._id.type)) {
      accountNetDeltas[accIdStr] -= amt;
    }
  });

  // 3. Inspect Goal Vault Balances vs Transfer Records
  const goals = await Goal.find({ ownerId: userObjectId }).lean();
  const goalTransferDeltas = await Transaction.aggregate([
    {
      $match: {
        ownerId: userObjectId,
        categoryId: 'vault',
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: '$subcategory',
        totalDepositedPaise: {
          $sum: {
            $cond: [{ $eq: ['$type', 'transfer_out'] }, '$amountPaise', 0]
          }
        },
        totalRefundedPaise: {
          $sum: {
            $cond: [{ $eq: ['$type', 'transfer_in'] }, '$amountPaise', 0]
          }
        }
      }
    }
  ]);

  const goalAudit = goals.map((g) => {
    const transferMatch = goalTransferDeltas.find(td => td._id === g.name);
    const netDeposited = transferMatch ? (transferMatch.totalDepositedPaise - transferMatch.totalRefundedPaise) : 0;
    return {
      goalId: g._id,
      goalName: g.name,
      savedPaise: g.savedPaise,
      targetPaise: g.targetPaise,
      status: g.status,
      ledgerTrackedPaise: netDeposited,
      isReconciled: g.savedPaise === netDeposited
    };
  });

  // 4. Verify Account Balance Agreement
  let totalStoredPaise = 0;
  let totalCalculatedPaise = 0;
  let overallMismatches = 0;

  const accountReports = accounts.map((acc) => {
    const accIdStr = acc._id.toString();
    const calculatedDelta = accountNetDeltas[accIdStr] || 0;
    totalStoredPaise += (acc.balancePaise || 0);

    // If openingBalancePaise was never established (legacy account)
    if (acc.openingBalancePaise === undefined || acc.openingBalancePaise === null) {
      return {
        accountId: acc._id,
        accountName: acc.name,
        accountType: acc.type,
        isActive: acc.isActive !== false,
        storedBalancePaise: acc.balancePaise,
        calculatedLedgerBalancePaise: null,
        openingBalancePaise: null,
        differencePaise: null,
        status: 'baseline_unavailable',
        audit: accountTypeStats[accIdStr] || {},
        note: 'Historical opening balance was not recorded upon creation; baseline cannot be verified without initial audit.'
      };
    }

    const calculatedBalance = acc.openingBalancePaise + calculatedDelta;
    totalCalculatedPaise += calculatedBalance;
    const difference = acc.balancePaise - calculatedBalance;
    const isMatched = difference === 0;

    if (!isMatched) overallMismatches++;

    return {
      accountId: acc._id,
      accountName: acc.name,
      accountType: acc.type,
      isActive: acc.isActive !== false,
      storedBalancePaise: acc.balancePaise,
      calculatedLedgerBalancePaise: calculatedBalance,
      openingBalancePaise: acc.openingBalancePaise,
      differencePaise: difference,
      status: isMatched ? 'matched' : 'mismatch',
      audit: accountTypeStats[accIdStr] || {},
      note: isMatched ? 'Ledger strictly reconciled' : 'Discrepancy detected between stored balance and transaction ledger'
    };
  });

  return {
    timestamp: new Date().toISOString(),
    ownerId,
    totalAccounts: accounts.length,
    totalStoredBalancePaise: totalStoredPaise,
    totalCalculatedBalancePaise: totalCalculatedPaise,
    totalMismatchedAccounts: overallMismatches,
    accounts: accountReports,
    goals: goalAudit,
    systemIntegrity: overallMismatches === 0 ? 'HEALTHY' : 'ATTENTION_REQUIRED'
  };
}

module.exports = {
  generateFinancialReconciliationReport
};

