// routes/authRoutes.js
const express = require("express")
const router = express.Router()
const { register, login, getMe } = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")
const { authLimiter } = require("../middleware/rateLimitMiddleware")
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware")

router.post("/register", authLimiter, validateRegister, register)
router.post("/login", authLimiter, validateLogin, login)
router.get("/me", protect, getMe)   // protected — must be logged in

module.exports = router