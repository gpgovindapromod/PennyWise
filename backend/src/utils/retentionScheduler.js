const { runRetentionCleanup } = require('./retentionService');

let schedulerTimer = null;

/**
 * Initializes the automated 24-hour retention scheduler.
 * Executes immediate cleanup check on startup, then schedules a daily recurring task.
 * 
 * @param {Object} opts
 * @param {number} opts.retentionDays - Age threshold in days (default: 90)
 * @param {number} opts.intervalMs - Scheduling interval (default: 24h = 86,400,000ms)
 */
function initRetentionScheduler({ retentionDays = 90, intervalMs = 24 * 60 * 60 * 1000 } = {}) {
  // Prevent duplicate scheduler timer instances
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  const runTask = async () => {
    try {
      console.log(`[Automated Retention] Starting daily cleanup cycle (policy: ${retentionDays} days)...`);
      const result = await runRetentionCleanup({ retentionDays });
      console.log(`[Automated Retention] Cycle complete. Archived & purged ${result.archivedCount} transactions older than ${result.cutoffDate.toISOString()}`);
    } catch (err) {
      console.error('[Automated Retention Error]: Failed during scheduled cleanup:', err.message);
    }
  };

  // Run initial check asynchronously after a 10-second server warmup
  setTimeout(runTask, 10000);

  // Set recurring daily interval
  schedulerTimer = setInterval(runTask, intervalMs);

  return {
    stop: () => {
      if (schedulerTimer) {
        clearInterval(schedulerTimer);
        schedulerTimer = null;
      }
    }
  };
}

module.exports = {
  initRetentionScheduler
};

