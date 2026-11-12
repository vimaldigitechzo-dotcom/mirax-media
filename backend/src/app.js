import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import {
  notFoundHandler,
  errorHandler,
} from './middleware/errorMiddleware.js';

const app = express();

// Trust reverse proxies (important for rate limiting behind Cloudflare, Vercel, Render, etc.)
app.set('trust proxy', 1);

// 1. Security Headers via Helmet
app.use(helmet());

// 2. CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://mirax-media-alpha.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      // Or any vercel.app deployment
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    credentials: true,
  })
);

// 3. Global General Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', globalLimiter);

// 4. Body Parsers with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. Mount API Routes
app.use('/api', contactRoutes);
app.use('/api/admin', adminRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MIRAX MEDIA Backend API is active.',
    healthEndpoint: '/api/health',
    contactEndpoint: '/api/contact',
    documentation: 'Refer to backend/README.md for API documentation.',
  });
});

// 6. Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
