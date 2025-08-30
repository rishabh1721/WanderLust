// seedReviews.js

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const seedReviews = async () => {
  const listings = await Listing.find({}).populate("owner");
  
  for (let listing of listings) {
    // Add 5 sample reviews
    for (let i = 1; i <= 5; i++) {
      const review = new Review({
        body: `This is review ${i} for ${listing.title}. Awesome stay!`,
        rating: Math.floor(Math.random() * 5) + 1,
        author: listing.owner._id || null,
      });
      listing.reviews.push(review);
      await review.save();
    }
    await listing.save();
  }

  console.log("✅ Reviews seeded");
  mongoose.connection.close();
};

seedReviews();
