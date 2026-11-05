const Transaction = require('../models/Transaction');
const ArchivedTransaction = require('../models/ArchivedTransaction');
const { withTransactionSession } = require('../utils/mongoSession');

/**
 * Executes a safe, verifiable 90-day retention cleanup.
 * Soft-deleted transactions older than retentionDays (default: 90)
 * are cleanly copied to ArchivedTransaction before permanent deletion.
 * Active (non-deleted) transactions are strictly untouched.
 * 
 * @param {Object} opts
 * @param {number} opts.retentionDays - Age in days of soft-deleted records to archive & purge (default: 90)
 * @param {string} [opts.ownerId] - Optional user filter
 * @returns {Promise<{ archivedCount: number, cutoffDate: Date }>}
 */
async function runRetentionCleanup({ retentionDays = 90, ownerId = null } = {}) {
  const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));

  const query = {
    isDeleted: true,
    deletedAt: { $lte: cutoffDate }
  };
  if (ownerId) {
    query.ownerId = ownerId;
  }

  // Find all eligible soft-deleted records older than 90 days
  const eligibleTxs = await Transaction.find(query);
  if (eligibleTxs.length === 0) {
    return { archivedCount: 0, cutoffDate };
  }

  return await withTransactionSession(async (session) => {
    const sessionOpt = session ? { session } : {};

    // 1. Prepare archive documents
    const archiveDocs = eligibleTxs.map(tx => ({
      originalTransactionId: tx._id,
      ownerId: tx.ownerId,
      accountId: tx.accountId,
      type: tx.type,
      amountPaise: tx.amountPaise,
      categoryId: tx.categoryId,
      categoryLabel: tx.categoryLabel,
      subcategory: tx.subcategory,
      date: tx.date,
      note: tx.note,
      paymentMethod: tx.paymentMethod,
      academicFeeId: tx.academicFeeId,
      transferId: tx.transferId,
      idempotencyKey: tx.idempotencyKey,
      deletedAt: tx.deletedAt || tx.updatedAt || new Date(),
      archivedAt: new Date(),
      retentionPolicyDays: retentionDays
    }));

    // 2. Insert into ArchivedTransaction audit store with duplicate ignore (idempotent multi-instance protection)
    try {
      await ArchivedTransaction.insertMany(archiveDocs, { ...sessionOpt, ordered: false });
    } catch (insertErr) {
      // If code 11000 duplicate key occurs (concurrent worker already archived), ignore duplicate collision
      if (insertErr.code !== 11000 && (!insertErr.writeErrors || !insertErr.writeErrors.some(e => e.code === 11000))) {
        throw insertErr;
      }
    }

    // 3. Remove archived records from active Transaction collection
    const idsToDelete = eligibleTxs.map(t => t._id);
    const deleteResult = await Transaction.deleteMany(
      { _id: { $in: idsToDelete }, isDeleted: true },
      sessionOpt
    );

    return {
      archivedCount: deleteResult.deletedCount,
      cutoffDate
    };
  });
}

module.exports = {
  runRetentionCleanup
};

