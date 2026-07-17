function Navbar({ activePage, setActivePage, onToggleSidebar, sidebarOpen }) {
    const links = [
        { id: "home", label: "Home" },
        { id: "demand", label: "Demand Predictor" },
        { id: "recommend", label: "Product Recommender" },
        { id: "user", label: "User Recommender" },
        { id: "model", label: "Model Info" },
    ]

    const currentLabel = links.find((link) => link.id === activePage)?.label || "Home"

    return (
        <nav style={styles.nav} className="navbar" aria-label="Main navigation">
            <button type="button" onClick={onToggleSidebar} style={styles.toggleBtn} aria-label="Toggle sidebar">
                {sidebarOpen ? "✕" : "☰"}
            </button>

            <div
                style={styles.brand}
                onClick={() => setActivePage("home")}
            >
                <span style={styles.brandMark}>DP</span>
                <span>Demand & Product Tools</span>
            </div>

            <div style={styles.pageBadge}>{currentLabel}</div>

            <div style={styles.links} className="navbar-links">
                {links.map((link) => (
                    <button
                        key={link.id}
                        type="button"
                        onClick={() => setActivePage(link.id)}
                        style={{
                            ...styles.link,
                            ...(activePage === link.id ? styles.active : {})
                        }}
                    >
                        {link.label}
                    </button>
                ))}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "rgba(7, 17, 31, 0.94)",
        backdropFilter: "blur(14px)",
        padding: "16px 24px",
        color: "white",
        boxShadow: "0 10px 30px rgba(7, 17, 31, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.08)"
    },
    toggleBtn: {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "white",
        fontSize: "20px",
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        cursor: "pointer",
        flexShrink: 0
    },
    brand: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#f8f9ff",
        cursor: "pointer",
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        letterSpacing: "0.2px",
        minWidth: 0
    },
    pageBadge: {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#f8f9ff",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },
    brandMark: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e94560, #ff7b53)",
        color: "white",
        fontSize: "13px",
        fontWeight: "800",
        boxShadow: "0 8px 18px rgba(233, 69, 96, 0.24)"
    },
    links: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap"
    },
    link: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#d8e0ee",
        padding: "8px 14px",
        borderRadius: "999px",
        cursor: "pointer",
        fontSize: "13px"
    },
    active: {
        background: "linear-gradient(135deg, #e94560, #ff6b6b)",
        borderColor: "transparent",
        color: "white",
        boxShadow: "0 8px 18px rgba(233, 69, 96, 0.2)"
    }
}

export default Navbar