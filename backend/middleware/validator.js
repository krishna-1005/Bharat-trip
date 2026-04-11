const { body, validationResult } = require("express-validator");

/**
 * Middleware to handle validation results and return errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }).escape(),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];

const reviewValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }).escape(),
  body("comment").trim().notEmpty().withMessage("Comment is required").isLength({ max: 500 }).escape(),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  validate
];

const planValidation = [
  body("city").trim().notEmpty().withMessage("City is required").isLength({ max: 50 }).escape(),
  body("days").isInt({ min: 1, max: 10 }).withMessage("Days must be between 1 and 10"),
  body("budget")
    .custom((value) => {
      if (typeof value === 'string' && ["low", "medium", "high"].includes(value)) return true;
      if (typeof value === 'number' && value >= 0) return true;
      if (!isNaN(Number(value)) && Number(value) >= 0) return true;
      throw new Error("Budget must be low, medium, high or a positive number");
    }),
  body("interests").isArray().withMessage("Interests must be an array"),
  body("interests.*").trim().isString().isLength({ max: 30 }).escape(),
  validate
];

module.exports = {
  signupValidation,
  loginValidation,
  reviewValidation,
  planValidation
};
