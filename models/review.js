const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for the review
const reviewSchema = new Schema({
  content: {
    type: String,
    required: [true, "Review content cannot be empty"], // Ensures content is provided
    trim: true, // Trimming spaces at the beginning and end
    minlength: [10, "Review content must be at least 10 characters long"], // Minimum length validation
    maxlength: [500, "Review content cannot exceed 500 characters"], // Maximum length validation
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"], // Ensures rating is provided
    min: [1, "Rating must be at least 1"], // Minimum rating value
    max: [5, "Rating cannot exceed 5"], // Maximum rating value
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true, // Ensures every review is linked to an author
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing", // Reference to the Listing model
    required: true, // Ensures review is linked to a specific listing
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the review creation time
  },
});

// Index for ensuring each user can leave only one review per listing
reviewSchema.index({ author: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
