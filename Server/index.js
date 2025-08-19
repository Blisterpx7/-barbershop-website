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
const jwt = require('jsonwebtoken');
// Stripe removed for free deployment - cash payments only
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_key');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Import models
const Customer = require('./models/customer.js');
const Barber = require('./models/barber.js');
const Service = require('./models/service.js');
const Appointment = require('./models/appointment.js');

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

// Test authentication endpoint (will be defined after authenticateToken function)
// app.get('/api/test-auth', authenticateToken, (req, res) => {
//   res.json({ 
//     message: 'Authentication successful!', 
//     timestamp: new Date().toISOString(),
//     user: {
//       id: req.user.userId,
//       email: req.user.email
//     }
//   });
// });

// CORS configuration with env-based allowlist (supports comma-separated origins)
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) {
      // Allow non-browser requests or same-origin
      return callback(null, true);
    }
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false
}));

// Handle preflight requests
app.options('*', cors());

// Serve static files for barber images — mount at a simple base path to avoid path-to-regexp issues
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

// Handle missing barber images with a default SVG returned at JPG path

// Use API routes
app.use('/api/auth', authRouter);
app.use('/api/barbers', barbersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/admin', adminRouter);
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

// Database connection is now handled in startServer function

// Ensure an admin user based on ADMIN_EMAIL env var
async function ensureAdminFromEnv() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    const customer = await Customer.findOne({ email: adminEmail.toLowerCase() });
    if (customer && !customer.isAdmin) {
      customer.isAdmin = true;
      await customer.save();
      console.log(`Promoted ${adminEmail} to admin via ADMIN_EMAIL env var`);
    }
  } catch (e) {
    console.error('ensureAdminFromEnv error:', e);
  }
}

// Ensure barber images on startup (for known barbers)
async function ensureBarberImages() {
  try {
    const emailToFilename = {
      'jamesmayang51@gmail.com': 'james.jpg'
    };

    for (const [email, filename] of Object.entries(emailToFilename)) {
      const filePath = path.join(__dirname, 'barbers', filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`Barber image not found on disk: ${filePath}`);
        continue;
      }

      const barber = await Barber.findOne({ email });
      if (!barber) continue;

      const desiredUrl = `/static/barber-images/${filename}`;
      if (barber.imageUrl !== desiredUrl) {
        barber.imageUrl = desiredUrl;
        await barber.save();
        console.log(`Set imageUrl for ${email} -> ${desiredUrl}`);
      }
    }
  } catch (e) {
    console.error('ensureBarberImages error:', e);
  }
}

// Call these functions after server starts to avoid blocking startup
setTimeout(() => {
  ensureAdminFromEnv();
  ensureBarberImages();
}, 1000);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  console.log('=== AUTHENTICATION MIDDLEWARE ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');

  if (!token) {
    console.log('❌ No token provided - returning 401');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token verified successfully for user:', user.userId);
    console.log('User data:', user);
    req.user = user;
    next();
  });
};

// Test authentication endpoint (now that authenticateToken is defined)
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Authentication successful!', 
    timestamp: new Date().toISOString(),
    user: {
      id: req.user.userId,
      email: req.user.email
    }
  });
});

// Authentication routes are now imported from ./routes/auth.js

// Service and barber routes are now imported from ./routes/services.js and ./routes/barbers.js

// Appointment Routes
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ customerId: req.user.userId })
      .populate('barberId', 'name')
      .populate('serviceId', 'name price')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', authenticateToken, [
  body('barberId').isMongoId().withMessage('Valid barber ID required'),
  body('serviceId').isMongoId().withMessage('Valid service ID required'),
  body('dateTime').isISO8601().withMessage('Valid date and time required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  console.log('=== APPOINTMENT CREATION REQUEST ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('User:', JSON.stringify(req.user, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { barberId, serviceId, dateTime, notes } = req.body;
    console.log('Extracted data:', { barberId, serviceId, dateTime, notes });

    // Check if barber and service exist
    const [barber, service] = await Promise.all([
      Barber.findById(barberId),
      Service.findById(serviceId)
    ]);

    console.log('Found barber and service:', { barber: !!barber, service: !!service });

    if (!barber || !service) {
      return res.status(404).json({ error: 'Barber or service not found' });
    }

    // Check if appointment date is in the past
    const appointmentDate = new Date(dateTime);
    const now = new Date();
    
    console.log('Date check:', { 
      appointmentDate: appointmentDate.toISOString(), 
      now: now.toISOString(), 
      isPast: appointmentDate < now,
      timezoneOffset: appointmentDate.getTimezoneOffset(),
      appointmentDateLocal: appointmentDate.toString(),
      nowLocal: now.toString()
    });
    
    if (appointmentDate < now) {
      return res.status(400).json({ error: 'Cannot book appointments in the past' });
    }

    // Check if appointment time is available
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    // Check for conflicting appointments
    const existingAppointments = await Appointment.find({
      barberId,
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('serviceId', 'duration');

    console.log('Existing appointments found:', existingAppointments.length);

    // Check if the new appointment conflicts with any existing appointment
    const hasConflict = existingAppointments.some(existingAppointment => {
      const existingStart = new Date(existingAppointment.dateTime);
      const existingEnd = new Date(existingStart.getTime() + (existingAppointment.serviceId.duration || 30) * 60000);
      
      // Check if appointments overlap
      return (appointmentDate < existingEnd && endTime > existingStart);
    });

    console.log('Conflict check:', { hasConflict, endTime });

    if (hasConflict) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    // Create appointment
    const appointment = new Appointment({
      customerId: req.user.userId,
      barberId,
      serviceId,
      dateTime: appointmentDate,
      notes,
      totalPrice: service.price,
      payment: {
        method: 'pending',
        status: 'pending'
      }
    });

    console.log('Saving appointment:', appointment);

    await appointment.save();

    // Populate references for response
    await appointment.populate('barberId', 'name');
    await appointment.populate('serviceId', 'name price');

    console.log('Appointment created successfully:', appointment._id);

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format provided' });
    }
    
    res.status(500).json({ error: 'Failed to create appointment', message: error.message });
  }
});

// Payment Routes
// Cash-only payment endpoint for free deployment
app.post('/api/payments/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('serviceId', 'name price');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Cash payment - no Stripe needed
    res.json({
      message: 'Cash payment selected',
      amount: appointment.totalPrice,
      paymentMethod: 'cash'
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

app.post('/api/payments/confirm', authenticateToken, async (req, res) => {
  try {
    const { appointmentId, paymentMethod, paymentIntentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update appointment payment status based on payment method
    appointment.payment.status = 'paid';
    appointment.payment.method = paymentMethod || 'online';
    appointment.payment.paidAt = new Date();
    
    if (paymentIntentId) {
      appointment.payment.stripePaymentIntentId = paymentIntentId;
    }
    
    // Set appointment status based on payment method
    if (paymentMethod === 'cash') {
      appointment.status = 'scheduled'; // Cash payments are confirmed at the shop
    } else {
      appointment.status = 'confirmed'; // Online payments are immediately confirmed
    }

    await appointment.save();

    res.json({
      message: 'Payment confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Test endpoint to create sample data
// Cancel Appointment Route
app.put('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('barberId', 'name')
      .populate('serviceId', 'name price');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this appointment' });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed appointment' });
    }

    // Check if appointment is within cancellation window (e.g., 2 hours before)
    const appointmentTime = new Date(appointment.dateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 2) {
      return res.status(400).json({ 
        error: 'Appointments can only be cancelled at least 2 hours before the scheduled time' 
      });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    if (reason) {
      appointment.notes = appointment.notes ? `${appointment.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    }
    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Reschedule Appointment Route
app.put('/api/appointments/:id/reschedule', authenticateToken, [
  body('newDateTime').isISO8601().withMessage('Valid date and time required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { newDateTime } = req.body;

    const appointment = await Appointment.findById(id)
      .populate('barberId', 'name')
      .populate('serviceId', 'name price duration');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to reschedule this appointment' });
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot reschedule cancelled appointment' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot reschedule completed appointment' });
    }

    // Check if new time is available
    const newAppointmentDate = new Date(newDateTime);
    const endTime = new Date(newAppointmentDate.getTime() + appointment.serviceId.duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      barberId: appointment.barberId._id,
      dateTime: { $lt: endTime },
      status: { $in: ['scheduled', 'confirmed'] },
      _id: { $ne: appointment._id }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'New time slot not available' });
    }

    // Update appointment
    appointment.dateTime = newAppointmentDate;
    appointment.status = 'scheduled'; // Reset to scheduled
    await appointment.save();

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// User Profile Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.userId).select('-password');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, preferences } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferences) updateData.preferences = preferences;

    const customer = await Customer.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin Routes
app.get('/api/admin/appointments', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you can add admin role to customer model)
    const customer = await Customer.findById(req.user.userId);
    if (!customer.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const appointments = await Appointment.find()
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name')
      .populate('serviceId', 'name price')
      .sort({ dateTime: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.put('/api/admin/appointments/:id/status', authenticateToken, [
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    const customer = await Customer.findById(req.user.userId);
    if (!customer.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = appointment.notes ? `${appointment.notes}\n\nAdmin note: ${notes}` : `Admin note: ${notes}`;
    }

    // If completed, add loyalty points
    if (status === 'completed' && appointment.status !== 'completed') {
      const customer = await Customer.findById(appointment.customerId);
      if (customer) {
        customer.loyaltyPoints += Math.floor(appointment.totalPrice / 10); // 1 point per 10 pesos
        await customer.save();
      }
    }

    await appointment.save();

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// Admin route to set/update a barber image by filename
app.put('http://localhost:3000/api/barbers/images/james.jpg', authenticateToken, [
  body('james.jpg').trim().notEmpty().withMessage('barbers')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const adminUser = await Customer.findById(req.user.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { filename } = req.body;
    const filePath = path.join(__dirname, 'barbers', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: 'File not found on server', filePath });
    }

    const barber = await Barber.findById(id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    barber.imageUrl = `/static/barber-images/${filename}`;
    await barber.save();

    res.json({
      message: 'Barber image updated successfully',
      barber
    });
  } catch (error) {
    console.error('Error updating barber image:', error);
    res.status(500).json({ error: 'Failed to update barber image' });
  }
});

// Search and Filter Routes
app.get('/api/search', async (req, res) => {
  try {
    const { q, category, priceMin, priceMax } = req.query;
    
    let query = { isActive: true };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }

    const services = await Service.find(query).sort({ popular: -1, name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/test-data', async (req, res) => {
  try {
    // Create sample services
    const services = [
      {
        name: 'Classic Haircut',
        description: 'Traditional men\'s haircut with wash and style',
        duration: 30,
        price: 25,
        category: 'haircut',
        popular: true
      },
      {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        duration: 20,
        price: 15,
        category: 'beard-trim'
      },
      {
        name: 'Hair Styling',
        description: 'Professional hair styling for special occasions',
        duration: 45,
        price: 35,
        category: 'styling'
      }
    ];

    for (const serviceData of services) {
      const existingService = await Service.findOne({ name: serviceData.name });
      if (!existingService) {
        const service = new Service(serviceData);
        await service.save();
      }
    }

    // Create sample barbers
    const barbers = [
      {
        name: 'James Andrei Mayang',
        email: 'jamesmayang51@gmail.com',
        phone: '+639977392206',
        specialties: ['styling', 'haircut'],
        experience: 2,
        rating: 5.0,
        totalReviews: 134,
        schedule: {
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          startTime: '10:00am',
          endTime: '8:00pm'
        },
        bio: 'Creative stylist known for trendy cuts and personalized service.',
        imageUrl: '/static/barber-images/james.jpg',
        isActive: true
      }
    ];

    for (const barberData of barbers) {
      const existingBarber = await Barber.findOne({ email: barberData.email });
      if (!existingBarber) {
        const barber = new Barber(barberData);
        await barber.save();
      }
    }

    res.json({ message: 'Sample data created successfully' });
  } catch (err) {
    console.error('Error creating test data:', err);
    res.status(500).json({ error: 'Failed to create test data' });
  }
});

app.get('/', async (req, res) => {
  try {
    const [services, barbers] = await Promise.all([
      Service.find({ isActive: true }),
      Barber.find({ isActive: true })
    ]);
    
    res.json({
      message: 'Barber Shop API is running',
      stats: {
        services: services.length,
        barbers: barbers.length
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
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