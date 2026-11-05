const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { noSqlSanitizer } = require('./middleware/noSqlSanitizer');
const logger = require('./utils/logger');
const crypto = require('crypto');

const app = express();

// Trust reverse proxy (Render, Heroku, Cloudflare, AWS ALB)
app.set('trust proxy', 1);

// High-speed gzip / deflate response compression (slashes JSON payload transfer sizes by 70-80%)
app.use(compression({
  threshold: 1024, // Only compress responses over 1KB
  level: 6
}));

// LAYER 1: Network & Perimeter Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.clientUrl, "https:"].filter(Boolean),
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow mobile apps, curl, or same-origin requests with no origin header
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiter for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Specific stricter brute-force limiter for Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests per 15 mins across auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' }
});
app.use('/api/auth/', authLimiter);

// Request body parser with payload limits (5mb to accommodate avatar uploads)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request correlation ID and structured observability logger
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`HTTP ${req.method} ${req.originalUrl}`, {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip
    });
  });
  next();
});

// LAYER 3 & 4: Defense Against NoSQL Injection
app.use(noSqlSanitizer);

// Health check (Liveness)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    service: 'pennywise-api',
    db: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Readiness check (Kubernetes / ECS Container Readiness)
app.get('/api/ready', (req, res) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  }
  return res.status(503).json({
    status: 'unready',
    database: 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Centralized Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/academics', require('./routes/academicRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/travel', require('./routes/travelRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Mask database details & stack traces in production
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (err.name === 'ValidationError') {
    response.message = Object.values(err.errors || {}).map((e) => e.message).join(', ') || err.message;
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    response.message = `Duplicate value entered for ${field}`;
  }

  if (config.env === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
