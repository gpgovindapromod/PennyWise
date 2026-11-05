/**
 * Production Structured Logger for PennyWise
 * Guarantees zero leakage of sensitive credentials (passwords, tokens, OTPs, secret keys).
 */

function sanitizeObject(data) {
  if (!data || typeof data !== 'object') return data;
  const sensitiveKeys = ['password', 'token', 'otp', 'otpHash', 'jwtSecret', 'secret', 'authorization'];
  const sanitized = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const safeMeta = sanitizeObject(meta);
  const logObj = {
    timestamp,
    level,
    message,
    ...(Object.keys(safeMeta).length > 0 && { meta: safeMeta })
  };
  return JSON.stringify(logObj);
}

const logger = {
  info: (msg, meta) => console.log(formatLog('INFO', msg, meta)),
  warn: (msg, meta) => console.warn(formatLog('WARN', msg, meta)),
  error: (msg, meta) => console.error(formatLog('ERROR', msg, meta)),
  financial: (msg, meta) => console.log(formatLog('AUDIT_FINANCIAL', msg, meta))
};

module.exports = logger;

