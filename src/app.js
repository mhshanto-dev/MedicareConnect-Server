import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requestLogger } from './middlewares/logger.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(helmet());
app.use(requestLogger);

// Base Route
app.get('/', (req, res) => {
  res.send('MediCare Connect API is running...');
});

// API Routes
import routes from './routes/index.js';
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
