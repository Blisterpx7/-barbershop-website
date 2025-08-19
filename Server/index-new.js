require('dotenv').config();
const express = require('express');
const connectDB = require('./db.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import middleware
const errorHandler = require('./middleware/errorHandler.js');
const { applySecurityMiddleware } = require('./middleware/security.js');
const logger = require('./utils/logger.js');

// Import routes
const { router: authRouter, authenticateToken } = require('./routes/auth.js');
const appointmentsRouter = require('./routes/appointments.js');
const servicesRouter = require('./routes/services.js');
const barbersRouter = require('./routes/barbers.js');
const adminRouter = require('./routes/admin.js');

const app = express();

// Environment validation
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logger.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
applySecurityMiddleware(app);

// Request logging
app.use(logger.logRequest);

// Static files for barber images
app.use('/static/barber-images', express.static(path.join(__dirname, 'barbers')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/appointments', authenticateToken, appointmentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/barbers', barbersRouter);
app.use('/api/admin', authenticateToken, adminRouter);

// Payment routes (simplified for now)
app.post('/api/payments/confirm', authenticateToken, async (req, res) => {
  try {
    const { appointmentId, paymentMethod } = req.body;
    
    // Import models here to avoid circular dependency
    const Appointment = require('./models/appointment.js');
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment payment status
    appointment.payment.status = 'paid';
    appointment.payment.method = paymentMethod || 'cash';
    appointment.payment.paidAt = new Date();
    
    // Set appointment status based on payment method
    if (paymentMethod === 'cash') {
      appointment.status = 'scheduled';
    } else {
      appointment.status = 'confirmed';
    }

    await appointment.save();

    logger.info(`Payment confirmed for appointment ${appointmentId}`, { paymentMethod });

    res.json({
      message: 'Payment confirmed successfully',
      appointment
    });
  } catch (error) {
    logger.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Handle missing barber images with default SVG
app.get('/api/barbers/images/default-barber.jpg', (req, res) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e5e7eb"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="200" cy="150" r="80" fill="#94a3b8"/>
  <rect x="80" y="240" width="240" height="120" rx="60" fill="#94a3b8"/>
  <text x="200" y="385" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#475569">No Image</text>
</svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
});

// Ensure admin user on startup
async function ensureAdminFromEnv() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    
    const Customer = require('./models/customer.js');
    const customer = await Customer.findOne({ email: adminEmail.toLowerCase() });
    if (customer && !customer.isAdmin) {
      customer.isAdmin = true;
      await customer.save();
      logger.info(`Promoted ${adminEmail} to admin via ADMIN_EMAIL env var`);
    }
  } catch (error) {
    logger.error('ensureAdminFromEnv error:', error);
  }
}

// Ensure barber images on startup
async function ensureBarberImages() {
  try {
    const emailToFilename = {
      'jamesmayang51@gmail.com': 'james.jpg'
    };

    for (const [email, filename] of Object.entries(emailToFilename)) {
      const filePath = path.join(__dirname, 'barbers', filename);
      if (!fs.existsSync(filePath)) {
        logger.warn(`Barber image not found on disk: ${filePath}`);
        continue;
      }

      const Barber = require('./models/barber.js');
      const barber = await Barber.findOne({ email });
      if (!barber) continue;

      const desiredUrl = `/static/barber-images/${filename}`;
      if (barber.imageUrl !== desiredUrl) {
        barber.imageUrl = desiredUrl;
        await barber.save();
        logger.info(`Set imageUrl for ${email} -> ${desiredUrl}`);
      }
    }
  } catch (error) {
    logger.error('ensureBarberImages error:', error);
  }
}

// Initialize startup functions
Promise.all([ensureAdminFromEnv(), ensureBarberImages()])
  .then(() => {
    logger.info('Startup initialization completed');
  })
  .catch(error => {
    logger.error('Startup initialization failed:', error);
  });

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    availableRoutes: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/services',
      '/api/barbers',
      '/api/appointments'
    ]
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 Barbery's Server v2.0.0 is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`📝 Logs directory: ${path.join(__dirname, 'logs')}`);
});
