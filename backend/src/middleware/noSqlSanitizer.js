const { AppError } = require('../errors/AppError');

/**
 * Four-Layer Security & NoSQL Injection Sanitizer
 * Recursively scans request payloads, rejecting any keys starting with $ or containing dots
 */
function sanitizeNoSql(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  if (Array.isArray(payload)) {
    return payload.map(sanitizeNoSql);
  }

  const clean = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new AppError(`Potentially malicious query key detected: "${key}"`, 400);
    }
    if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeNoSql(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const noSqlSanitizer = (req, res, next) => {
  try {
    if (req.body) req.body = sanitizeNoSql(req.body);
    if (req.query) req.query = sanitizeNoSql(req.query);
    if (req.params) req.params = sanitizeNoSql(req.params);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  noSqlSanitizer,
  sanitizeNoSql
};
