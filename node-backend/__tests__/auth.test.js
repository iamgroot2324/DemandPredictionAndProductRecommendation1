// __tests__/auth.test.js
// Jest tests for authentication endpoints

const request = require("supertest")
const app = require("../server")

describe("Auth Routes", () => {
    describe("POST /auth/register", () => {
        it("should register a new user with valid data", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({
                    name: "Test User",
                    email: `test${Date.now()}@example.com`,
                    password: "SecurePass123"
                })

            expect(res.statusCode).toBe(201)
            expect(res.body).toHaveProperty("token")
            expect(res.body.user).toHaveProperty("email")
        })

        it("should reject registration without name", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({
                    email: "test@example.com",
                    password: "SecurePass123"
                })

            expect(res.statusCode).toBe(400)
            expect(res.body).toHaveProperty("error")
        })

        it("should reject registration with invalid email", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({
                    name: "Test User",
                    email: "invalid-email",
                    password: "SecurePass123"
                })

            expect(res.statusCode).toBe(400)
        })

        it("should reject weak password", async () => {
            const res = await request(app)
                .post("/auth/register")
                .send({
                    name: "Test User",
                    email: "test@example.com",
                    password: "weak"
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.error).toContain("Password")
        })
    })

    describe("POST /auth/login", () => {
        it("should login with valid credentials", async () => {
            const email = `test${Date.now()}@example.com`
            
            // Register first
            await request(app)
                .post("/auth/register")
                .send({
                    name: "Test User",
                    email: email,
                    password: "SecurePass123"
                })

            // Then login
            const res = await request(app)
                .post("/auth/login")
                .send({
                    email: email,
                    password: "SecurePass123"
                })

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty("token")
        })

        it("should reject invalid credentials", async () => {
            const res = await request(app)
                .post("/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "WrongPassword123"
                })

            expect(res.statusCode).toBe(400)
            expect(res.body).toHaveProperty("error")
        })
    })

    describe("GET /auth/me", () => {
        it("should reject without token", async () => {
            const res = await request(app)
                .get("/auth/me")

            expect(res.statusCode).toBe(401)
        })
    })
})
