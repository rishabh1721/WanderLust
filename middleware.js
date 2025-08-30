// middleware.js

// Import dependencies and models
const ExpressError = require("./utils/ExpressError");
const Listing = require("./models/listing"); // Import the Listing model
const Review = require('./models/review'); // Ensure Review model is imported if used by isReviewAuthor (from previous context)
const { User } = require("./models/user"); // Assuming User model is exported this way

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
  // Check if the request is an API request (e.g., starts with /api/)
  const isApiRequest = req.originalUrl.startsWith('/api/');

  if (!req.isAuthenticated()) {
    if (isApiRequest) {
      // For API requests, send a JSON error response
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in.' });
    } else {
      // For regular web requests, store the original URL and redirect to login
      req.session.returnTo = req.originalUrl; // Store the URL they were trying to access
      req.flash("error", "You must be logged in first!");
      return res.redirect("/login");
    }
  }
  next();
};

// Middleware to save the returnTo URL after login (from previous context)
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// Middleware to check if the current user is the owner of the listing
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing) {
    return next(new ExpressError(404, "Listing not found"));
  }

  // Ensure the logged-in user is the owner of the listing
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to perform this action.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// Middleware to check if the current user is the author of a review (from previous context)
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found.');
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};


// Middleware to catch errors asynchronously
const wrapAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware to handle flash messages globally in views
const flashMessages = (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
};

// Middleware to handle global error handling
const handleErrors = (err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  
  // Log errors to the console for debugging in development
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }
  
  // Render the error page with the error details
  res.status(statusCode).render("error", { err });
};

// Middleware to handle user authorization on pages
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    req.flash("error", "You must be an admin to access this page");
    return res.redirect("/");
  }
};

module.exports = {
  isLoggedIn,
  storeReturnTo, // Exported for use in app.js
  isOwner,
  isReviewAuthor, // Exported for use in review routes
  wrapAsync,
  flashMessages,
  handleErrors,
  isAdmin
};
