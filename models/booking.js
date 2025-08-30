// models/booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: [1, 'At least one guest is required'],
  },
  roomType: {
    type: String,
    required: true,
    enum: ['standard', 'deluxe', 'suite', 'penthouse'], // updated to match form choices
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v > this.checkIn;
      },
      message: 'Check-out date must be later than check-in date',
    },
  },
  breakfast: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total must be a positive number'],
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paymentId: {
    type: String,
    default: null,
    unique: true,
  },
}, { timestamps: true });

// Indexes for performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ listing: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
