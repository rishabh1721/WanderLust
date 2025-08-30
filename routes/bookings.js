// routes/bookings.js

// ─────────────────────────────────────────────────────────────────────────────
// 1) Load environment variables (so process.env.UPI_ID is available)
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const router = express.Router({ mergeParams: true });
const QRCode = require('qrcode');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const { isLoggedIn } = require('../middleware');

// ─────────────────────────────────────────────────────────────────────────────
// SHOW booking form (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/new/:listingId',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { listingId } = req.params;

    // Validate that listingId can be cast to a valid ObjectId
    if (!Listing.schema.path('_id').cast(listingId)) {
      req.flash('error', 'Invalid listing ID.');
      return res.redirect('/listings');
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash('error', 'Listing not found.');
      return res.redirect('/listings');
    }

    res.render('bookings/new', {
      listing,
      theme: req.user.prefersDark ? 'dark' : 'light'
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// CREATE booking & generate QR code
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/:listingId',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { listingId } = req.params;
    const { guests, roomType, checkIn, checkOut, breakfast } = req.body;

    // 1) Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash('error', 'Listing not found.');
      return res.redirect('/listings');
    }

    // 2) Validate required fields
    if (!guests || !roomType || !checkIn || !checkOut) {
      req.flash('error', 'All booking details are required.');
      return res.redirect(`/listings/${listingId}/book/new`);
    }

    // 3) Calculate number of nights and total amount
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end - start) / 86400000));
    const totalGuests = parseInt(guests, 10);
    let total = listing.price * nights * totalGuests;
    if (breakfast === 'yes') {
      total += (listing.breakfastFee || 500) * totalGuests;
    }

    // 4) Create booking document
    const booking = await Booking.create({
      user: req.user._id,
      listing: listing._id,
      guests: totalGuests,
      roomType,
      checkIn,
      checkOut,
      breakfast: breakfast === 'yes',
      total,
      paid: false
    });

    // ────────────────────────────────────────────────────────────────────────────
    // 5) Define UPI_ID “in the middle,” exactly where it was working before.
    //    Ensure that this VPA (rishabhkmrr008@oksbi) is active in Google Pay.
    // ────────────────────────────────────────────────────────────────────────────
    const UPI_ID = process.env.UPI_ID || 'rishabhkmrr008@oksbi';
    if (!UPI_ID.includes('@')) {
      console.warn(
        `⚠️  Warning: UPI_ID ("${UPI_ID}") does not contain '@'.\n` +
        `    Ensure .env contains a valid UPI ID (username@bank).`
      );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 6) Build the UPI URL with:
    //    • pa = raw UPI_ID (e.g., rishabhkmrr008@oksbi)
    //    • pn = listing title (spaces → %20)
    //    • am = total formatted with two decimals (e.g., "5700.00")
    //    • cu = INR
    //    • tn = "Booking <bookingId>" (spaces → %20)
    // ────────────────────────────────────────────────────────────────────────────
    const payeeName = listing.title || 'Wanderlust Booking';
    // Replace spaces with %20 (don’t encode @ or other chars)
    const encodedPayeeName = payeeName.split(' ').join('%20');
    const formattedAmount = total.toFixed(2); // e.g. "5700.00"
    const encodedTxnNote = `Booking ${booking._id}`.split(' ').join('%20');

    const upiUrl =
      `upi://pay?pa=${UPI_ID}` +
      `&pn=${encodedPayeeName}` +
      `&am=${formattedAmount}` +
      `&cu=INR` +
      `&tn=${encodedTxnNote}`;

    // 7) Log the exact UPI URL for manual paste‐in testing
    console.log('→ Generated UPI URL:', upiUrl);

    // 8) Generate QR code data URL from this UPI URL
    const qrCodeDataURL = await QRCode.toDataURL(upiUrl);

    // 9) Render the “qrpay” view with the same locals as before
    res.render('bookings/qrpay', {
      listing,
      bookingDetails: {
        checkIn,
        checkOut,
        guests: totalGuests,
        roomType,
        breakfast: breakfast === 'yes'
      },
      bookingId: booking._id,
      qrCodeDataURL,
      amount: total,
      paymentUrl: upiUrl,
      theme: req.user.prefersDark ? 'dark' : 'light'
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// REVISIT payment page (regenerate QR if user reloads)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/:listingId/:bookingId/payment',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { listingId, bookingId } = req.params;

    const [listing, booking] = await Promise.all([
      Listing.findById(listingId),
      Booking.findById(bookingId)
    ]);

    if (!listing || !booking) {
      req.flash('error', 'Booking or listing not found.');
      return res.redirect(`/listings/${listingId}`);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5) Define UPI_ID again “in the middle” (same as above).
    // ──────────────────────────────────────────────────────────────────────────
    const UPI_ID = process.env.UPI_ID || 'rishabhkmrr008@oksbi';
    if (!UPI_ID.includes('@')) {
      console.warn(`⚠️  Warning: UPI_ID ("${UPI_ID}") does not contain '@'.`);
    }

    // 6) Rebuild the same UPI URL
    const payeeName = listing.title || 'Wanderlust Booking';
    const encodedPayeeName = payeeName.split(' ').join('%20');
    const formattedAmount = booking.total.toFixed(2); // e.g. "5700.00"
    const encodedTxnNote = `Booking ${booking._id}`.split(' ').join('%20');

    const upiUrl =
      `upi://pay?pa=${UPI_ID}` +
      `&pn=${encodedPayeeName}` +
      `&am=${formattedAmount}` +
      `&cu=INR` +
      `&tn=${encodedTxnNote}`;

    // Optional: log it again for debugging
    console.log('→ Re-generated UPI URL:', upiUrl);

    const qrCodeDataURL = await QRCode.toDataURL(upiUrl);

    res.render('bookings/qrpay', {
      listing,
      bookingDetails: {
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10),
        guests: booking.guests,
        roomType: booking.roomType,
        breakfast: booking.breakfast
      },
      bookingId,
      qrCodeDataURL,
      amount: booking.total,
      paymentUrl: upiUrl,
      theme: req.user.prefersDark ? 'dark' : 'light'
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM payment (mark booking as paid and assign a paymentId) – unchanged
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/:listingId/:bookingId/confirm',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { listingId, bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ExpressError('Booking not found', 404);

    booking.paid = true;
    booking.paymentId = `UPI-${Date.now()}`;
    await booking.save();
    res.redirect(`/listings/${listingId}/book/${bookingId}/confirmation`);
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMATION page (show success) – unchanged
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/:listingId/:bookingId/confirmation',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) throw new ExpressError('Booking not found', 404);

    res.render('bookings/confirmation', {
      booking,
      theme: req.user.prefersDark ? 'dark' : 'light'
    });
  })
);

module.exports = router;
