// init/index.js
require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing");
const User = require("../models/user");

const MONGO_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to DB");

    const someUser = await User.findOne();
    if (!someUser) {
      console.error("❌ No users found—please create one first.");
      process.exit(1);
    }

    await Listing.deleteMany({});
    console.log("🧹 Old listings deleted");

    // since initData is already an array
    const listingsToInsert = initData.map(raw => ({
      title: raw.title,
      description: raw.description,
      price: raw.price,
      location: raw.location,
      country: raw.country,
      images: [{ url: raw.image }],
      owner: someUser._id
    }));

    await Listing.insertMany(listingsToInsert);
    console.log(`✅ ${listingsToInsert.length} listings inserted`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during initialization:", err);
    process.exit(1);
  }
}

main();
