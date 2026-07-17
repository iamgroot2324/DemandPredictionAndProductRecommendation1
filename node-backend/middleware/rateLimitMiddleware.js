// middleware/rateLimitMiddleware.js
// Rate limiting to prevent abuse

const rateLimit = require("express-rate-limit")

// General API rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false
})

// Auth rate limiter: 5 attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login/register attempts, please try again later",
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
})

// ML prediction rate limiter: 30 requests per minute
const mlLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: "Too many predictions, please try again later",
    standardHeaders: true,
    legacyHeaders: false
})

// Batch prediction limiter: 5 per minute
const batchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Batch predictions limited to 5 per minute",
    standardHeaders: true,
    legacyHeaders: false
})

module.exports = {
    generalLimiter,
    authLimiter,
    mlLimiter,
    batchLimiter
}
