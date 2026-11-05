const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { initRetentionScheduler } = require('./utils/retentionScheduler');

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`[PennyWise Server] listening on http://localhost:${config.port} (${config.env} mode)`);
    // Initialize automated 90-day retention scheduler
    initRetentionScheduler({ retentionDays: 90 });
  });
}).catch((err) => {
  console.error('[PennyWise Server Init Error]:', err.message);
});
