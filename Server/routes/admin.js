const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/appointment.js');
const Customer = require('../models/customer.js');
const Barber = require('../models/barber.js');
const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.userId);
    if (!customer || !customer.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Get all appointments (admin view)
router.get('/appointments', requireAdmin, async (req, res) => {
  try {
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

// Update appointment status (admin)
router.put('/appointments/:id/status', requireAdmin, [
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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

// Get admin dashboard stats
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      totalCustomers,
      totalRevenue
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({
        dateTime: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      }),
      Appointment.countDocuments({ status: { $in: ['scheduled', 'confirmed'] } }),
      Customer.countDocuments(),
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    res.json({
      stats: {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        totalCustomers,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
