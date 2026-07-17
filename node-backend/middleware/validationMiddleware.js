// middleware/validationMiddleware.js
// Centralized request validation using express-validator

const { body, validationResult } = require("express-validator")

// Validation middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: "Validation failed",
            details: errors.array().map(e => ({ field: e.param, message: e.msg }))
        })
    }
    next()
}

// ── Auth Validation ───────────────────────────────────────────────────────

const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email")
        .trim()
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
        .matches(/[A-Z]/).withMessage("Password must contain uppercase letter")
        .matches(/[0-9]/).withMessage("Password must contain number"),
    validate
]

const validateLogin = [
    body("email")
        .trim()
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    validate
]

// ── Product Validation ────────────────────────────────────────────────────

const validateProductCode = [
    body("code")
        .trim()
        .notEmpty().withMessage("Product code is required")
        .isLength({ min: 1, max: 50 }).withMessage("Invalid product code"),
    validate
]

// ── Customer Validation ───────────────────────────────────────────────────

const validateCustomerName = [
    body("name")
        .trim()
        .notEmpty().withMessage("Customer name is required"),
    validate
]

module.exports = {
    validate,
    validateRegister,
    validateLogin,
    validateProductCode,
    validateCustomerName
}
