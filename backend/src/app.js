import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import {
  notFoundHandler,
  errorHandler,
} from './middleware/errorMiddleware.js';

const app = express();

// Trust reverse proxies (Render, Cloudflare, Vercel)
app.set('trust proxy', 1);

// 1. CORS Configuration (Handled first so all cross-origin requests receive proper headers)
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
      // Allow requests with no origin (mobile apps, curl, server-to-server proxies like Vercel rewrites)
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

// 2. Security Headers via Helmet (Configured to allow cross-origin API communication)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
  })
);

// 3. Cookie Parser
app.use(cookieParser());

// 4. Global General Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 5. Body Parsers with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', contactRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'MIRAX MEDIA API & Admin Engine',
    version: '2.0.0',
    status: 'ONLINE',
    adminLogin: '/admin',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      auth: '/api/auth/login',
      admin: '/api/admin/*',
      publicData: '/api/public/data',
    },
  });
});

// 7. Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
