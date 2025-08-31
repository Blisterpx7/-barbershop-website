// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? './env.production' : './env.development';
console.log('Loading environment from:', envFile);
console.log('Current working directory:', process.cwd());
require('dotenv').config({ path: envFile });

// Log environment variables for debugging
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `Set (${process.env.JWT_SECRET.substring(0, 20)}...)` : 'Not set');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('================================');

const express = require('express');
const connectDB = require('./db.js');
const cors = require('cors');
const path = require('path');

// Import models
const Service = require('./models/service.js');
const Barber = require('./models/barber.js');
const Customer = require('./models/customer.js');

// Import routes
const { router: authRouter } = require('./routes/auth.js');
const barbersRouter = require('./routes/barbers.js');
const servicesRouter = require('./routes/services.js');
const appointmentsRouter = require('./routes/appointments.js');
const adminRouter = require('./routes/admin.js');

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  next();
});

app.use(express.json());

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Barbershop Backend API is running!', 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      auth: '/api/auth',
      barbers: '/api/barbers',
      services: '/api/services',
      appointments: '/api/appointments',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const serviceCount = await Service.countDocuments();
    const barberCount = await Barber.countDocuments();
    const customerCount = await Customer.countDocuments();
    
    res.json({ 
      message: 'Database connection successful!', 
      timestamp: new Date().toISOString(),
      counts: {
        services: serviceCount,
        barbers: barberCount,
        customers: customerCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed', message: error.message });
  }
});

// CORS configuration with env-based allowlist (supports comma-separated origins)
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

// Force CORS headers for production
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Always allow requests from your Vercel domain
    if (origin === 'https://james-barbery.vercel.app') {
      console.log('✅ Vercel origin allowed:', origin);
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('✅ Localhost origin allowed:', origin);
      return callback(null, true);
    }
    
    if (!origin) {
      // Allow non-browser requests or same-origin
      console.log('✅ Allowing request without origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log('⚠️ Origin not in allowlist, but allowing anyway for production:', origin);
    return callback(null, true); // Allow all origins in production
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests more explicitly
app.options('*', (req, res) => {
  console.log('OPTIONS preflight request received');
  console.log('Request origin:', req.headers.origin);
  
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  console.log('✅ CORS headers set for origin:', req.headers.origin || '*');
  res.status(200).end();
});

// Serve static files for barber images
app.use('/static/barber-images', express.static(path.join(__dirname, 'barbers')));

// Backward-compatible redirect for old path
app.get('/api/barbers/images/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'barbers', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).end();
    }
  });
});

// Handle missing barber images with a default SVG
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

// Use API routes
app.use('/api/auth', authRouter);
app.use('/api/barbers', barbersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/admin', adminRouter);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/test',
      'GET /api/test-db',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/barbers',
      'GET /api/services',
      'GET /api/appointments',
      'POST /api/appointments'
    ]
  });
});

const PORT = process.env.PORT || 3000;

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('Starting server...');
    console.log('Port:', PORT);
    console.log('Environment:', process.env.NODE_ENV);
    
    await connectDB();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('MongoDB connection established successfully');
      console.log('Server ready to accept requests');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();