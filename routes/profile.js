// routes/profile.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn, wrapAsync } = require("../middleware");
const multer = require("multer");
const path = require("path");

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images")); // Save uploaded images to the "images" folder in "public"
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid overwriting
  }
});
const upload = multer({ storage });

// Show edit profile form
router.get(
  "/profile/edit",
  isLoggedIn,
  (req, res) => {
    res.render("profile/edit", { user: req.user });
  }
);

// Handle profile update
router.put(
  "/profile/edit",
  isLoggedIn,
  upload.single("avatar"), // Handle avatar file upload
  wrapAsync(async (req, res) => {
    const { username, email } = req.body;
    let avatar = req.body.avatar; // If no new file is uploaded, keep the old avatar
    
    // If a new avatar file is uploaded, update the avatar field with the new image path
    if (req.file) {
      avatar = `/images/${req.file.filename}`;
    }

    // Update the user's profile in the database
    await User.findByIdAndUpdate(
      req.user._id,
      { username, email, avatar },
      { runValidators: true, new: true }
    );

    req.flash("success", "Profile updated successfully!");
    res.redirect("/dashboard/guest");
  })
);

module.exports = router;
