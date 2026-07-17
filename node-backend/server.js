// server.js
// Main entry point for the Node.js backend
require("dotenv").config()

const express  = require("express")
const mongoose = require("mongoose")
const cors     = require("cors")
const authRoutes = require("./routes/authRoutes")

const productRoutes  = require("./routes/productRoutes")
const customerRoutes = require("./routes/customerRoutes")
const mlRoutes       = require("./routes/mlRoutes")

const { generalLimiter } = require("./middleware/rateLimitMiddleware")

const app  = express()
const PORT = process.env.PORT || 4000

// ── Environment Validation ────────────────────────────────────────────────────

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"]
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env])
if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(", ")}`)
    process.exit(1)
}

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors())                    // allow React (port 3000) to call this server
app.use(express.json())            // parse incoming JSON bodies
app.use(generalLimiter)            // rate limit all routes


// ── Connect to MongoDB ────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB error:", err)
        process.exit(1)
    })

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/products",  productRoutes)
app.use("/customers", customerRoutes)
app.use("/ml",        mlRoutes)
app.use("/auth", authRoutes)

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
    res.json({
        status: "running",
        routes: {
            "GET  /products":               "all products",
            "GET  /products/:code":         "one product",
            "GET  /products/filter/laptops":"laptops only",
            "GET  /products/filter/phones": "phones only",
            "GET  /customers":              "all customers",
            "GET  /customers/:name":        "one customer",
            "POST /ml/predict":             "demand prediction",
            "POST /ml/predict/batch":       "batch prediction",
            "POST /ml/recommend/user":      "user recommendations",
            "POST /ml/recommend/product":   "similar products",
            "GET  /ml/model/info":          "model details"
        }
    })
})

// ── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

// ── Global Error Handler ──────────────────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error("Error:", err)
    const status = err.status || 500
    const message = err.message || "Internal server error"
    res.status(status).json({ error: message })
})

// ── Start server ──────────────────────────────────────────────────────────────

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Node server running on port ${PORT}`)
    })
}

module.exports = app