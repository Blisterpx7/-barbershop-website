const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/appointment.js');
const Barber = require('../models/barber.js');
const Service = require('../models/service.js');
const Customer = require('../models/customer.js');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all appointments for a customer
router.get('/', authenticateToken, async (req, res) => {
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

// Create new appointment
router.post('/', authenticateToken, [
  body('barberId').isMongoId().withMessage('Valid barber ID required'),
  body('serviceId').isMongoId().withMessage('Valid service ID required'),
  body('dateTime').isISO8601().withMessage('Valid date and time required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { barberId, serviceId, dateTime, notes } = req.body;

    // Check if barber and service exist
    const [barber, service] = await Promise.all([
      Barber.findById(barberId),
      Service.findById(serviceId)
    ]);

    if (!barber || !service) {
      return res.status(404).json({ error: 'Barber or service not found' });
    }

    // Check if appointment date is in the past
    const appointmentDate = new Date(dateTime);
    const now = new Date();
    
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

    // Check if the new appointment conflicts with any existing appointment
    const hasConflict = existingAppointments.some(existingAppointment => {
      const existingStart = new Date(existingAppointment.dateTime);
      const existingEnd = new Date(existingStart.getTime() + existingAppointment.serviceId.duration * 60000);
      
      // Check if appointments overlap
      return (appointmentDate < existingEnd && endTime > existingStart);
    });

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
      totalPrice: service.price
    });

    await appointment.save();

    // Populate references for response
    await appointment.populate('barberId', 'name');
    await appointment.populate('serviceId', 'name price');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, [
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

// Reschedule appointment
router.put('/:id/reschedule', authenticateToken, [
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

module.exports = router;
