import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import ErrorBoundary from "./components/ErrorBoundary"
import Sidebar from "./components/Sidebar"

// Lazy load heavy components for faster initial load
const Dashboard = lazy(() => import("./components/Dashboard"))
const DemandPredictor = lazy(() => import("./components/DemandPredictor"))
const ProductRecommender = lazy(() => import("./components/ProductRecommender"))
const UserRecommender = lazy(() => import("./components/UserRecommender"))
const ModelInfo = lazy(() => import("./components/ModelInfo"))
const Login = lazy(() => import("./components/Login"))
const Register = lazy(() => import("./components/Register"))

// Loading fallback component
function PageLoader() {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
            color: "white"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    border: "4px solid #6366f1",
                    borderTop: "4px solid #10b981",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px"
                }} />
                <p>Loading...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    )
}

function App() {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [activePage, setActivePage] = useState(() => {
        const savedPage = window.localStorage.getItem("activePage")
        return savedPage || "home"
    })
    const [authPage, setAuthPage] = useState("login")
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const pageConfig = useMemo(() => ({
        home: { path: "/", label: "Home" },
        demand: { path: "/demand", label: "Demand Predictor" },
        recommend: { path: "/recommend", label: "Product Recommender" },
        user: { path: "/user", label: "User Recommender" },
        model: { path: "/model", label: "Model Info" },
    }), [])

    useEffect(() => {
        const pathMap = {
            "/": "home",
            "/demand": "demand",
            "/recommend": "recommend",
            "/user": "user",
            "/model": "model",
        }

        setActivePage(pathMap[location.pathname] || "home")
        window.localStorage.setItem("activePage", pathMap[location.pathname] || "home")
    }, [location.pathname])

    const handleNavigate = (page) => {
        const nextPath = pageConfig[page]?.path || "/"
        setActivePage(page)
        window.localStorage.setItem("activePage", page)
        navigate(nextPath)
    }

    const openSidebar = () => setSidebarOpen(true)
    const closeSidebar = () => setSidebarOpen(false)

    if (!user) {
        return (
            <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    {authPage === "login"
                        ? <Login
                            onSwitch={() => setAuthPage("register")}
                            onSuccess={() => handleNavigate("home")}
                          />
                        : <Register
                            onSwitch={() => setAuthPage("login")}
                            onSuccess={() => handleNavigate("home")}
                          />
                    }
                </Suspense>
            </ErrorBoundary>
        )
    }

    return (
        <ErrorBoundary>
            <div className="app-shell">
                <div className="app-glow app-glow-1" />
                <div className="app-glow app-glow-2" />

                <div className="app-body">
                    <div className="sidebar-hover-zone" onMouseEnter={openSidebar} />
                    <Sidebar
                        activePage={activePage}
                        setActivePage={handleNavigate}
                        isOpen={sidebarOpen}
                        onClose={closeSidebar}
                    />

                    <main className="app-main">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<Dashboard setActivePage={handleNavigate} />} />
                                <Route path="/demand" element={<DemandPredictor />} />
                                <Route path="/recommend" element={<ProductRecommender />} />
                                <Route path="/user" element={<UserRecommender />} />
                                <Route path="/model" element={<ModelInfo />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </main>
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default App