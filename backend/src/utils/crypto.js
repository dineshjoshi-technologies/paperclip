const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;
const PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS = 1;
const API_KEY_PREFIX = 'dk_';

function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateApiKey() {
  const raw = crypto.randomBytes(32).toString('hex');
  return `${API_KEY_PREFIX}${raw}`;
}

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN_DAYS,
  PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS,
  API_KEY_PREFIX,
  generateSecureToken,
  generateApiKey,
  hashApiKey,
};
