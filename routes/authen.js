const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();

// ========== REGISTER ==========

// Show register form
router.get("/register", (req, res) => {
  res.render("auth/register");
});

// Handle register logic
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("error", "That email is already registered.");
      return res.redirect("/register");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("error", "That username is already taken.");
      return res.redirect("/register");
    }

    // Create and register new user
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    // Log in the user after registration
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to Wanderlust, ${username}!`);
      res.redirect("/listings");
    });
  } catch (err) {
    console.error("Registration error:", err);
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

// ========== LOGIN ==========

// Show login form
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// Handle login logic (login via email)
router.post("/login", wrapAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("/login");
  }

  // Inject username into the request body so Passport can use it
  req.body.username = user.username;

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome back, ${user.username}!`);
      const redirectUrl = req.session.returnTo || "/listings";
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    });
  })(req, res, next);
}));

// ========== LOGOUT ==========

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have logged out successfully.");
    res.redirect("/listings");
  });
});

module.exports = router;