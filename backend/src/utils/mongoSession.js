const mongoose = require('mongoose');

/**
 * Helper to obtain or verify an active MongoDB Session.
 * Safely executes transactions on replica sets, with gated fallback for non-production standalone.
 * 
 * In production: Never bypasses sessions or transactions; throws original replica/write error.
 * In development/test: If standalone MongoDB without replica set is encountered, falls back to non-transactional execution.
 */
async function withTransactionSession(work) {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (err) {
    const errMsg = (err.message || '') + ' ' + (err.errorResponse?.errmsg || '') + ' ' + (err.originalError?.message || '');
    const isStandaloneErr = (
      errMsg.includes('replica set') ||
      errMsg.includes('Transaction numbers are only allowed on a replica set member') ||
      errMsg.includes('does not support retryable writes')
    );

    if (isStandaloneErr) {
      if (process.env.NODE_ENV === 'production') {
        const prodErr = new Error(
          '[FATAL FINANCIAL SAFETY VIOLATION] MongoDB replica-set transaction is required in production mode. ' +
          'Single-node standalone deployments cannot guarantee multi-document atomicity for financial operations. ' +
          'Please connect to a MongoDB Atlas replica set with retryWrites=true&w=majority.'
        );
        prodErr.statusCode = 503;
        prodErr.isOperational = false;
        throw prodErr;
      }
      return await work(null);
    }
    throw err;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

module.exports = {
  withTransactionSession
};

