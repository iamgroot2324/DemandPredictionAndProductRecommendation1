// src/components/Register.js
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

function Register({ onSwitch, onSuccess }) {
    const { login } = useAuth()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError("Please fill in all fields")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const res = await axios.post(
                "http://localhost:4000/auth/register",
                { name, email, password }
            )
            login(res.data.user, res.data.token)
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card} className="auth-card">
                <h1 style={styles.brand}>DPPRS</h1>
                <p style={styles.sub}>Demand Prediction & Product Recommendation</p>
                <h2 style={styles.title}>Create Account</h2>

                <input
                    style={styles.input}
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                />

                {error && <p style={styles.error}>{error}</p>}

                <button
                    style={styles.btn}
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>

                <p style={styles.switchText}>
                    Already have an account?{" "}
                    <span style={styles.link} onClick={onSwitch}>
                        Sign In
                    </span>
                </p>
            </div>
        </div>
    )
}

const styles = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg, rgba(7,17,31,.96), rgba(15,52,96,.92))", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
    card: { background: "rgba(255,255,255,0.94)", padding: "44px 36px", borderRadius: "22px", width: "100%", maxWidth: "430px", boxShadow: "0 24px 70px rgba(7, 17, 31, 0.28)", border: "1px solid rgba(255,255,255,0.55)" },
    brand: { color: "#e94560", fontSize: "30px", fontWeight: "800", textAlign: "center", marginBottom: "6px" },
    sub: { color: "#6c7a92", fontSize: "12px", textAlign: "center", marginBottom: "28px" },
    title: { color: "#132238", fontSize: "22px", fontWeight: "800", marginBottom: "20px" },
    input: { width: "100%", padding: "12px 14px", marginBottom: "14px", backgroundColor: "#f7f9fc", border: "1px solid #dce4f0", borderRadius: "11px", color: "#132238", fontSize: "15px", outline: "none", boxSizing: "border-box" },
    error: { color: "#e94560", fontSize: "13px", marginBottom: "10px" },
    btn: { width: "100%", padding: "13px 14px", background: "linear-gradient(135deg, #e94560, #ff6b6b)", color: "white", border: "none", borderRadius: "11px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "18px" },
    switchText: { color: "#6c7a92", fontSize: "14px", textAlign: "center" },
    link: { color: "#e94560", cursor: "pointer", fontWeight: "700" }
}

export default Register