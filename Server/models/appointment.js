const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  totalPrice: {
    type: Number,
    required: true
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'online', 'pending'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    paidAt: Date
  },
  tip: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ customerId: 1, dateTime: 1 });
appointmentSchema.index({ barberId: 1, dateTime: 1 });
appointmentSchema.index({ status: 1, dateTime: 1 });

// Virtual for total amount including tip
appointmentSchema.virtual('totalAmount').get(function() {
  return this.totalPrice + this.tip;
});

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function() {
  return this.dateTime < new Date();
};

// Method to check if appointment is today
appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.dateTime);
  return appointmentDate.toDateString() === today.toDateString();
};

module.exports = mongoose.model('Appointment', appointmentSchema); 