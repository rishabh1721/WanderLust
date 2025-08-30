const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

const dummyReviews = [
  { rating: 5, body: "Amazing stay, loved every bit of it!" },
  { rating: 4, body: "Really cozy place, perfect for a weekend getaway." },
  { rating: 3, body: "Decent stay but could be cleaner." },
  { rating: 5, body: "The host was wonderful. Definitely coming again!" },
  { rating: 4, body: "Great location, very peaceful." },
  { rating: 2, body: "Not as expected, but staff were helpful." },
];

const seedReviews = async () => {
  const listings = await Listing.find({});
  const user = await User.findOne(); // get any user for author

  for (let listing of listings) {
    listing.reviews = []; // Clear previous reviews

    for (let i = 0; i < 5; i++) {
      const review = new Review({
        rating: dummyReviews[i].rating,
        body: dummyReviews[i].body,
        author: user._id,
      });
      await review.save();
      listing.reviews.push(review);
    }

    await listing.save();
  }

  console.log("✅ Seeded 5 reviews for each listing.");
  mongoose.connection.close();
};

seedReviews();
