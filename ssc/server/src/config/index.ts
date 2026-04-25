import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

function isStrongJwtSecret(secret?: string): boolean {
  if (!secret) return false;

  const trimmed = secret.trim();
  if (trimmed.length < 32) return false;

  const lower = trimmed.toLowerCase();
  const weakMarkers = [
    'change-me',
    'default',
    'example',
    'placeholder',
    'generate_',
    'your_',
    'secret_here',
    'replace_me',
  ];

  return !weakMarkers.some((marker) => lower.includes(marker));
}

function resolveJwtSecret(envKey: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[envKey];

  if (nodeEnv === 'test') {
    return value || `${envKey.toLowerCase()}-test-fallback-value`;
  }

  if (!isStrongJwtSecret(value)) {
    throw new Error(
      `[config] ${envKey} must be set to a strong secret (>=32 chars, non-default placeholder) when NODE_ENV is not "test".`,
    );
  }

  return value as string;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv,
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: resolveJwtSecret('JWT_SECRET'),
    refreshSecret: resolveJwtSecret('JWT_REFRESH_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'debug',
};
