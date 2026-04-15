const rateLimit = require("express-rate-limit");

// Global rate limiter for all endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});

// Stricter limiter for auth/login routes: max 20 attempts per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts",
    message: "Too many login attempts from this IP, please try again after 15 minutes."
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};
