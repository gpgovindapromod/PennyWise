const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`[PennyWise Server] listening on http://localhost:${config.port} (${config.env} mode)`);
  });
}).catch((err) => {
  console.error('[PennyWise Server Init Error]:', err.message);
});
