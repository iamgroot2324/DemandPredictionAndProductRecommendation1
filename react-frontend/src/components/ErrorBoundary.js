import React from "react"

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
                    color: "white",
                    textAlign: "center",
                    padding: "20px"
                }}>
                    <h1>⚠️ Something went wrong</h1>
                    <p>{this.state.error?.message || "An unexpected error occurred"}</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null })
                            window.location.href = "/"
                        }}
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            fontSize: "16px",
                            background: "#6366f1",
                            border: "none",
                            borderRadius: "5px",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        Go Home
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
