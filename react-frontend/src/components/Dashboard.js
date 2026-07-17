// src/components/Dashboard.js
// Landing page — shows system overview and quick stats

import { useState, useEffect } from "react"
import { getModelInfo, getAllProducts, getAllCustomers } from "../services/api"

function Dashboard({ setActivePage }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const [modelData, productData, customerData] = await Promise.all([
                    getModelInfo(),
                    getAllProducts(),
                    getAllCustomers()
                ])
                setStats({
                    mse: modelData.test_mse,
                    trainedOn: modelData.trained_on,
                    products: productData.total,
                    customers: customerData.total,
                    algorithm: modelData.algorithm
                })
            } catch (err) {
                console.log("Stats load error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const cards = [
        {
            id: "demand",
            title: "Demand Predictor",
            desc: "Predict how many units a product will sell based on its price. Built with Linear Regression and Gradient Descent from scratch.",
            icon: "📈",
            color: "#e94560"
        },
        {
            id: "recommend",
            title: "Product Recommender",
            desc: "Find products similar to any item using Content-Based Filtering and Cosine Similarity on product features.",
            icon: "🔍",
            color: "#0f3460"
        },
        {
            id: "user",
            title: "User Recommender",
            desc: "Get personalised recommendations for any customer using Collaborative Filtering based on purchase history.",
            icon: "👤",
            color: "#533483"
        },
        {
            id: "model",
            title: "Model Info",
            desc: "View detailed information about the ML models — accuracy metrics, parameters, and algorithm details.",
            icon: "🤖",
            color: "#05c46b"
        }
    ]

    return (
        <div style={styles.container}>
            <div style={styles.hero} className="dashboard-hero">
                <div style={styles.badge}>Commerce dashboard</div>
                <h1 style={styles.heroTitle}>
                    Demand Prediction and Product Recommendation
                </h1>
                <p style={styles.heroSubtitle}>
                    A simple dashboard for reviewing demand forecasts and product suggestions from the built-in recommendation tools.
                </p>
                <div style={styles.heroActions}>
                    <button style={styles.primaryBtn} onClick={() => setActivePage("demand")}>Open Demand Tool</button>
                    <button style={styles.secondaryBtn} onClick={() => setActivePage("recommend")}>Open Recommender</button>
                </div>
            </div>

            {!loading && stats && (
                <div style={styles.statsRow}>
                    <div style={styles.statCard} className="stat-card">
                        <span style={styles.statNum}>{stats.products?.toLocaleString()}</span>
                        <span style={styles.statLabel}>Transactions</span>
                    </div>
                    <div style={styles.statCard} className="stat-card">
                        <span style={styles.statNum}>{stats.customers?.toLocaleString()}</span>
                        <span style={styles.statLabel}>Customers</span>
                    </div>
                    <div style={styles.statCard} className="stat-card">
                        <span style={styles.statNum}>{stats.trainedOn?.toLocaleString()}</span>
                        <span style={styles.statLabel}>Training Rows</span>
                    </div>
                    <div style={styles.statCard} className="stat-card">
                        <span style={styles.statNum}>{stats.mse}</span>
                        <span style={styles.statLabel}>Model MSE</span>
                    </div>
                </div>
            )}

            <div style={styles.grid}>
                {cards.map(card => (
                    <div
                        key={card.id}
                        style={{ ...styles.card, borderColor: card.color + "30" }}
                        className="feature-card"
                        onClick={() => setActivePage(card.id)}
                    >
                        <div style={{
                            ...styles.iconBox,
                            backgroundColor: card.color + "15",
                            color: card.color
                        }}>
                            {card.icon}
                        </div>
                        <h3 style={styles.cardTitle}>{card.title}</h3>
                        <p style={styles.cardDesc}>{card.desc}</p>
                        <span style={{ ...styles.cardLink, color: card.color }}>
                            Try it →
                        </span>
                    </div>
                ))}
            </div>

            <div style={styles.techSection} className="tech-section">
                <h3 style={styles.techTitle}>Built with</h3>
                <div style={styles.techRow}>
                    {["Python", "Flask", "Linear Regression",
                        "Cosine Similarity", "Node.js", "Express",
                        "MongoDB", "React"].map(tech => (
                            <span key={tech} style={styles.techTag}>
                                {tech}
                            </span>
                        ))}
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: { maxWidth: "1150px", margin: "0 auto", padding: "12px 8px 28px" },
    hero: { textAlign: "center", padding: "36px 24px 30px", marginBottom: "20px", background: "rgba(255,255,255,0.9)", borderRadius: "22px", border: "1px solid rgba(15, 52, 96, 0.08)", boxShadow: "0 18px 40px rgba(15, 52, 96, 0.08)" },
    badge: { display: "inline-block", padding: "7px 12px", borderRadius: "999px", background: "rgba(233, 69, 96, 0.1)", color: "#e94560", fontSize: "12px", fontWeight: "700", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "14px" },
    heroTitle: { fontSize: "32px", fontWeight: "700", color: "#132238", marginBottom: "12px", lineHeight: "1.25" },
    heroSubtitle: { fontSize: "15px", color: "#64748b", maxWidth: "680px", margin: "0 auto", lineHeight: "1.7" },
    heroActions: { display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px", flexWrap: "wrap" },
    primaryBtn: { padding: "10px 16px", border: "none", borderRadius: "999px", background: "linear-gradient(135deg, #0f3460, #1f4b83)", color: "white", cursor: "pointer", fontWeight: "600", boxShadow: "0 10px 20px rgba(15, 52, 96, 0.16)" },
    secondaryBtn: { padding: "10px 16px", border: "1px solid #d9e1eb", borderRadius: "999px", background: "white", color: "#31405a", cursor: "pointer", fontWeight: "600" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "22px" },
    statCard: { background: "linear-gradient(135deg, #ffffff, #f8fbff)", borderRadius: "18px", padding: "22px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(15, 52, 96, 0.08)", boxShadow: "0 14px 28px rgba(15, 52, 96, 0.06)" },
    statNum: { fontSize: "22px", fontWeight: "700", color: "#1f2a44" },
    statLabel: { fontSize: "12px", color: "#73809a", textTransform: "uppercase", letterSpacing: "1px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "22px" },
    card: { background: "linear-gradient(135deg, #ffffff, #f9fbff)", borderRadius: "18px", padding: "24px", cursor: "pointer", border: "1px solid rgba(15, 52, 96, 0.08)", boxShadow: "0 14px 28px rgba(15, 52, 96, 0.06)", transition: "transform 0.2s ease, box-shadow 0.2s ease" },
    iconBox: { width: "52px", height: "52px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "14px" },
    cardTitle: { fontSize: "18px", fontWeight: "700", color: "#132238", marginBottom: "8px" },
    cardDesc: { color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" },
    cardLink: { fontSize: "14px", fontWeight: "700" },
    techSection: { background: "rgba(255,255,255,0.9)", borderRadius: "18px", padding: "24px", textAlign: "center", border: "1px solid rgba(15, 52, 96, 0.08)", boxShadow: "0 12px 24px rgba(15, 52, 96, 0.05)" },
    techTitle: { fontSize: "15px", color: "#73809a", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1px" },
    techRow: { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" },
    techTag: { background: "#f5f7fb", color: "#31405a", padding: "7px 14px", borderRadius: "999px", fontSize: "13px" }
}

export default Dashboard