const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");

const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// CREATE REVIEW
router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Ensure the review contains both content and a rating
    const { content, rating } = req.body.review;

    if (!content || !rating) {
      req.flash("error", "Both content and rating are required.");
      return res.redirect(`/listings/${listing._id}`);
    }

    if (rating < 1 || rating > 5) {
      req.flash("error", "Rating must be between 1 and 5.");
      return res.redirect(`/listings/${listing._id}`);
    }

    // Creating a new review
    const review = new Review({
      content,
      rating,
      author: req.user._id,
      listing: listing._id, // Link review to the listing
    });

    listing.reviews.push(review); // Add review to the listing's review array

    await review.save();
    await listing.save();

    req.flash("success", "Review added!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// DELETE REVIEW
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
