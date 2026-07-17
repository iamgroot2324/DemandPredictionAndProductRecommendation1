import { useAuth } from "../context/AuthContext"

function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
    const { user, logout } = useAuth()

    const links = [
        { id: "home", icon: "🏠", label: "Home" },
        { id: "demand", icon: "📈", label: "Demand Predictor" },
        { id: "recommend", icon: "🔍", label: "Product Recommender" },
        { id: "user", icon: "👤", label: "User Recommender" },
        { id: "model", icon: "🤖", label: "Model Info" },
    ]

    const handleNav = (id) => {
        setActivePage(id)
    }

    const handleLogout = () => {
        logout()
    }

    const handleClose = () => {
        if (typeof onClose === "function") {
            onClose()
        }
    }

    const collapsed = !isOpen

    if (!isOpen) {
        return null
    }

    return (
        <aside
            style={styles.sidebar}
            className="sidebar-panel sidebar-open"
        >
            <div style={styles.header}>
                <div style={styles.brandWrap}>
                    <div style={styles.brandLogo}>DP</div>
                </div>
                <button type="button" onClick={handleClose} style={styles.closeBtn} aria-label="Close sidebar">
                    ✕
                </button>
            </div>

            {isOpen && (
                <>
                    <div style={styles.userBox}>
                        <div style={styles.avatar}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>{user?.name}</span>
                            <span style={styles.userEmail}>{user?.email}</span>
                        </div>
                    </div>

                    <div style={styles.divider} />
                </>
            )}

            <nav style={styles.nav} aria-label="Sidebar navigation">
                {links.map((link) => (
                    <button
                        key={link.id}
                        type="button"
                        onClick={() => handleNav(link.id)}
                        title={link.label}
                        style={{
                            ...styles.navBtn,
                            ...(activePage === link.id ? styles.navBtnActive : {}),
                            justifyContent: collapsed ? "center" : "flex-start"
                        }}
                    >
                        <span style={styles.navIcon}>{link.icon}</span>
                        {isOpen && <span>{link.label}</span>}
                    </button>
                ))}
            </nav>

            <div style={styles.bottom}>
                {isOpen && <div style={styles.divider} />}
                <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
                    <span>🚪</span>
                    {isOpen && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    )
}

const styles = {
    sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "260px",
        height: "100vh",
        background: "linear-gradient(180deg, rgba(8, 15, 31, 0.98) 0%, rgba(11, 22, 41, 0.98) 100%)",
        backdropFilter: "blur(18px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 300,
        overflowY: "auto",
        boxShadow: "16px 0 40px rgba(4, 10, 24, 0.24)",
        transform: "translateX(0)",
        transition: "transform 0.25s ease"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "24px 20px 16px"
    },
    brandLogo: { fontSize: "16px", fontWeight: "800", color: "white", letterSpacing: "0.6px", background: "linear-gradient(135deg, #e94560, #ff7b53)", width: "36px", height: "36px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px rgba(233, 69, 96, 0.24)" },
    brandWrap: { display: "flex", alignItems: "center" },
    closeBtn: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#dfe7f5",
        fontSize: "16px",
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        cursor: "pointer"
    },
    userBox: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px 14px", margin: "0 12px", borderRadius: "16px", background: "rgba(255,255,255,0.04)" },
    avatar: { width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #e94560, #ff7b53)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "17px", flexShrink: 0, boxShadow: "0 10px 22px rgba(233, 69, 96, 0.24)" },
    userInfo: { display: "flex", flexDirection: "column", overflow: "hidden" },
    userName: { color: "white", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    userEmail: { color: "#8ea0bb", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    divider: { height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)", margin: "12px 20px" },
    nav: { display: "flex", flexDirection: "column", padding: "8px 12px", gap: "6px", flex: 1 },
    navBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", backgroundColor: "transparent", border: "1px solid transparent", color: "#9fb0cb", borderRadius: "12px", cursor: "pointer", fontSize: "14px", textAlign: "left", width: "100%", transition: "all 0.2s ease" },
    navBtnActive: { background: "linear-gradient(90deg, rgba(233, 69, 96, 0.2), rgba(255, 123, 83, 0.14))", color: "#ff8da4", fontWeight: "700", borderColor: "rgba(233, 69, 96, 0.24)" },
    navIcon: { fontSize: "18px", width: "22px", textAlign: "center" },
    bottom: { padding: "0 12px 24px" },
    logoutBtn: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#9fb0cb", borderRadius: "12px", cursor: "pointer", fontSize: "14px", width: "100%" }
}

export default Sidebar