// app.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require("cors");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const Booking = require("./models/booking"); // Include the Booking model
const QRCode = require("qrcode"); // QR code generator

// Import your new models and routes
const Message = require('./models/message');
const Conversation = require('./models/conversation');
const messagesRoutes = require('./routes/messages'); // Your new messages routes

// Import the socket handler
const socketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// ===== MongoDB Setup =====
const dbUrl = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(dbUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ===== View Engine =====
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// ===== Session Config =====
const secret = process.env.SESSION_SECRET || "aStrongSecretKeyInProduction";
const MongoStore = require('connect-mongo'); // For persistent sessions
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 // lazy update session
});

store.on("error", e => {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: 'session', // Avoid default session cookie name for security
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "lax", // 'strict' or 'lax' for CSRF protection
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.set("trust proxy", process.env.NODE_ENV === "production"); // Trust proxy headers in production
const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);

// ===== Flash & Passport =====
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Local Strategy
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
// Serialize and deserialize user for session management
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===== Socket.IO Setup (using socketHandler) =====
// Initialize Socket.IO with the HTTP server and get the io instance
const io = socketHandler.init(server);

// ***************************************************************
// ADD THIS CRUCIAL LINE: Attach the io instance to the Express app
app.set('io', io);
// ***************************************************************

// Share Express session and Passport with Socket.IO
// This ensures req.session and req.user are available on socket.request during handshake
io.engine.use((req, res, next) => {
  sessionMiddleware(req, res, () => {
    // Passport.initialize() must run before Passport.session()
    passport.initialize()(req, res, () => {
      passport.session()(req, res, next);
    });
  });
});

// ===== CORS Configuration =====
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

// ===== Locals (available in EJS templates) =====
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ===== Routes =====
const authRoutes = require("./routes/authen");
const dashboardRoutes = require("./routes/dashboard");
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const bookingRoutes = require("./routes/bookings");
const profileRoutes = require("./routes/profile");
const chatbotRoutes = require("./routes/chatbot");
const pageRoutes = require("./routes/pages");
const uploadRoutes = require("./routes/api/upload");

// Route Mounting
app.use(authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/bookings", bookingRoutes);
app.use(profileRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/messages", messagesRoutes); // Use the messages router
app.use(pageRoutes);
app.use("/api/upload", uploadRoutes);

// Home Route
app.get("/", (req, res) => res.render("home"));

// 404 Error Handler
app.all("*", (req, res, next) => next(new ExpressError(404, "Page Not Found")));

// Global Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  if (process.env.NODE_ENV === "development") console.error(err.stack);
  res.status(statusCode).render("error", { err });
});

// ===== QR Payment Route =====
app.get('/qrpay/:bookingId', async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('listing');

    if (!booking) {
      return next(new ExpressError(404, "Booking not found"));
    }

    const qrCodeDataUrl = await QRCode.toDataURL(`https://yourdomain.com/bookings/${bookingId}/pay`);
    const amount = booking.totalAmount;

    res.render('qrpay', {
      qrCodeImage: qrCodeDataUrl,
      bookingId,
      amount,
      listing: booking.listing
    });

  } catch (error) {
    next(error);
  }
});

// Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});