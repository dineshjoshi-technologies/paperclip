import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDB, prisma } from './config/database';
import { redis } from './config/redis';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

async function start() {
  await connectDB();

  // Test Redis connection
  try {
    await redis.ping();
  } catch (error) {
    console.warn('Redis not available, continuing without caching');
  }

  const server = app.listen(config.port, () => {
    console.log(`SSC Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });

  async function gracefulShutdown(signal: string) {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      try {
        await redis.quit();
      } catch {
        // ignore
      }
      console.log('Shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
