// routes/listings.js

const express = require('express');
const router = express.Router();
const { Types } = require('mongoose');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isOwner } = require('../middleware');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const QRCode = require('qrcode');

// Helper to get theme
const getTheme = (user) => (user?.prefersDark ? 'dark' : 'light');

// INDEX: Show all listings (with pagination)
router.get(
  '/',
  wrapAsync(async (req, res) => {
    const { location, guests, page = 1 } = req.query;
    const filters = {};

    if (location?.trim()) {
      filters.location = { $regex: location.trim(), $options: 'i' };
    }
    if (guests && !isNaN(guests)) {
      filters.guests = { $gte: parseInt(guests, 10) };
    }

    const limit = 30;
    const skip = (page - 1) * limit;

    const [listings, totalListings] = await Promise.all([
      Listing.find(filters).skip(skip).limit(limit),
      Listing.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(totalListings / limit);

    res.render('listings/index', {
      listings,
      search: req.query,
      theme: getTheme(req.user),
      currentUser: req.user,
      success: req.flash('success'),
      error: req.flash('error'),
      pagination: {
        currentPage: Number(page),
        totalPages,
      },
    });
  })
);

// NEW: Form to create a new listing
router.get('/new', isLoggedIn, (req, res) => {
  res.render('listings/new', {
    theme: getTheme(req.user),
    currentUser: req.user,
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

// CREATE: Save new listing
router.post(
  '/',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { listing } = req.body;

    // Convert images field (if it exists) into the proper array format
    const imagesArray = Array.isArray(listing.images)
      ? listing.images.map((img) => ({ url: img.url || img }))
      : listing.image
      ? [{ url: listing.image }]
      : [];

    const newListing = new Listing({
      ...listing,
      images: imagesArray,
      owner: req.user._id,
    });

    await newListing.save();
    req.flash('success', 'New listing created!');
    res.redirect(`/listings/${newListing._id}`);
  })
);

// SHOW: Show listing details
router.get(
  '/:id',
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid listing ID');
    }

    const listing = await Listing.findById(id)
      .populate({ path: 'reviews', populate: { path: 'author' } })
      .populate('owner');

    if (!listing) {
      throw new ExpressError(404, 'Listing not found');
    }

    const isOwnerFlag =
      req.user && listing.owner && listing.owner._id.equals(req.user._id);

    res.render('listings/show', {
      listing,
      isOwner: isOwnerFlag,
      currentUser: req.user,
      theme: getTheme(req.user),
      success: req.flash('success'),
      error: req.flash('error'),
    });
  })
);

// EDIT: Form to edit a listing
router.get(
  '/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid listing ID');
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, 'Listing not found');
    }

    res.render('listings/edit', {
      listing,
      theme: getTheme(req.user),
      currentUser: req.user,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  })
);

// UPDATE: Save edited listing
router.put(
  '/:id',
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;
    if (!Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid listing ID');
    }

    const imagesArray = Array.isArray(listing.images)
      ? listing.images.map((img) => ({ url: img.url || img }))
      : listing.image
      ? [{ url: listing.image }]
      : [];

    const updatedData = {
      ...listing,
      images: imagesArray,
    };

    await Listing.findByIdAndUpdate(id, updatedData, {
      runValidators: true,
      new: true,
    });

    req.flash('success', 'Listing updated!');
    res.redirect(`/listings/${id}`);
  })
);

// DELETE: Delete a listing
router.delete(
  '/:id',
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid listing ID');
    }
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted!');
    res.redirect('/listings');
  })
);

// BOOK: Show booking page
router.get(
  '/:id/book',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid listing ID');
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, 'Listing not found');
    }
    res.render('bookings/new', {
      listing,
      theme: getTheme(req.user),
      currentUser: req.user,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  })
);

// CREATE PAYMENT REQUEST: Generate UPI QR code
router.post(
  '/:id/book/create-payment-request',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, 'Invalid listing ID');
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, 'Listing not found');
    }

    const { guests, roomType, checkIn, checkOut, breakfast } = req.body;
    if (!guests || !roomType || !checkIn || !checkOut) {
      req.flash('error', 'Missing booking details.');
      return res.redirect(`/listings/${id}/book`);
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    let total = nights * listing.price * guests;
    if (breakfast === 'yes') {
      total += (listing.breakfastFee || 500) * guests;
    }

    const booking = new Booking({
      user: req.user._id,
      listing: listing._id,
      guests,
      roomType,
      checkIn,
      checkOut,
      breakfast,
      total,
      paid: false,
    });
    await booking.save();

    // ────────────────────────────────────────────────────────────────────────────
    // Build the UPI URL with:
    //   • pa = raw UPI_ID (no encodeURIComponent on '@')
    //   • pn = "Wanderlust Booking" (spaces → %20)
    //   • am = total.toFixed(2) (e.g. "5700.00")
    //   • cu = INR
    //   • tn = "Booking <bookingId>" (spaces → %20)
    // ────────────────────────────────────────────────────────────────────────────
    const UPI_ID = process.env.UPI_ID || 'rishabhkmrr008@oksbi';
    if (!UPI_ID.includes('@')) {
      console.warn(
        `⚠️  Warning: UPI_ID ("${UPI_ID}") does not contain '@'.\n` +
          `    Ensure .env contains a valid UPI ID (username@bank).`
      );
    }

    const payeeName = 'Wanderlust Booking'.split(' ').join('%20');
    const formattedAmount = total.toFixed(2); // e.g. "5700.00"
    const txnNote = `Booking ${booking._id}`.split(' ').join('%20');

    const upiPaymentUrl =
      `upi://pay?pa=${UPI_ID}` +
      `&pn=${payeeName}` +
      `&am=${formattedAmount}` +
      `&cu=INR` +
      `&tn=${txnNote}`;

    // Log for manual testing (copy/paste after "upi://pay?")
    console.log('→ Generated UPI URL:', upiPaymentUrl);

    QRCode.toDataURL(upiPaymentUrl, (err, qrCodeDataURL) => {
      if (err) {
        return res.status(500).send('Error generating QR code');
      }

      res.render('bookings/qrpay', {
        listing,
        bookingDetails: { checkIn, checkOut, guests, roomType, breakfast },
        bookingId: booking._id,
        qrCodeDataURL,
        amount: total,
        paymentUrl: upiPaymentUrl,
        theme: getTheme(req.user),
        currentUser: req.user,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    });
  })
);

// CONFIRM PAYMENT
router.post(
  '/:listingId/book/:bookingId/confirm',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { listingId, bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ExpressError(404, 'Booking not found');
    }

    booking.paid = true;
    booking.paymentId = `DEMO-${Date.now()}`;
    await booking.save();

    req.flash('success', 'Payment confirmed! Booking successful.');
    // Redirect to the ORIGINAL confirmation route:
    res.redirect(`/listings/${booking._id}/confirmation`);
  })
);

// CONFIRMATION PAGE (Original pattern)
router.get(
  '/:bookingId/confirmation',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      throw new ExpressError(404, 'Booking not found');
    }

    res.render('bookings/confirmation', {
      booking,
      theme: getTheme(req.user),
      currentUser: req.user,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  })
);

module.exports = router;
