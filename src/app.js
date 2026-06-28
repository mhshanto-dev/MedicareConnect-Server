import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth.js';
import { requestLogger } from './middlewares/logger.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import routes from './routes/index.js';

const app = express();

// ──────────────────────────────────────────
// 1. CORS & Cookies (must be first)
// ──────────────────────────────────────────
const allowedOrigins = [
  // Production URLs — must match exactly what the browser sends as Origin header
  'https://frontend-orpin-eight-50.vercel.app',
  'https://backend-two-jade-51.vercel.app',
  // From environment variable (Vercel dashboard)
  process.env.CLIENT_URL,
  process.env.BETTER_AUTH_URL,
  // Local development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
].filter(Boolean); // remove undefined entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any Vercel deployment preview URL for this project
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());

// ──────────────────────────────────────────
// 2. Better Auth handler (BEFORE express.json)
//    Handles: Google OAuth, sessions, sign-out
//    Path:    /api/auth/*
// ──────────────────────────────────────────
app.all('/api/auth/*', toNodeHandler(auth));

// ──────────────────────────────────────────
// 3. Body parsing (for all non-Better-Auth routes)
// ──────────────────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────
// 4. Security middleware
// ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(helmet());
app.use(mongoSanitize());
app.use(requestLogger);

// ──────────────────────────────────────────
// 5. API routes (JWT auth, doctors, appointments, etc.)
//    Custom JWT auth is now at /api/users/*
// ──────────────────────────────────────────
app.use('/api', routes);

// ──────────────────────────────────────────
// 6. Error handling
// ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
