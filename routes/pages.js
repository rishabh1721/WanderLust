// routes/pages.js
const express = require("express");
const router = express.Router();

// ========== Explore ==========
router.get("/explore", (req, res) => res.render("pages/explore", { title: "Explore" }));
router.get("/browse", (req, res) => res.render("pages/browse", { title: "Browse" }));
router.get("/map", (req, res) => res.render("pages/map", { title: "Map" }));
router.get("/experiences", (req, res) => res.render("pages/experiences", { title: "Experiences" }));
router.get("/destinations", (req, res) => res.render("pages/destinations", { title: "Destinations" }));
router.get("/categories", (req, res) => res.render("pages/uniqueStays", { title: "Unique Stays" }));

// ========== Hosting ==========
router.get("/host-your-place", (req, res) => res.render("pages/hostYourPlace", { title: "Host Your Place" }));
router.get("/resources", (req, res) => res.render("pages/hostingResources", { title: "Hosting Resources" }));
router.get("/responsibility", (req, res) => res.render("pages/responsibleHosting", { title: "Responsible Hosting" }));
router.get("/community", (req, res) => res.render("pages/communityForum", { title: "Community Forum" }));
router.get("/host-protection", (req, res) => res.render("pages/hostProtection", { title: "Host Protection" }));

// ========== Support ==========
router.get("/help", (req, res) => res.render("pages/helpCenter", { title: "Help Center" }));
router.get("/trust", (req, res) => res.render("pages/trustSafety", { title: "Trust & Safety" }));
router.get("/cancellation", (req, res) => res.render("pages/cancellationOptions", { title: "Cancellation Options" }));
router.get("/accessibility", (req, res) => res.render("pages/accessibility", { title: "Accessibility" }));
router.get("/report", (req, res) => res.render("pages/reportConcern", { title: "Report a Concern" }));

// ========== Company ==========
router.get("/about", (req, res) => res.render("pages/about", { title: "About Us" }));
router.get("/careers", (req, res) => res.render("pages/careers", { title: "Careers" }));
router.get("/press", (req, res) => res.render("pages/press", { title: "Press" }));
router.get("/blog", (req, res) => res.render("pages/blog", { title: "Blog" }));
router.get("/terms", (req, res) => res.render("pages/termsPrivacy", { title: "Terms & Privacy" }));
router.get("/privacy", (req, res) => res.render("pages/privacy", { title: "Privacy Policy" }));

module.exports = router;

