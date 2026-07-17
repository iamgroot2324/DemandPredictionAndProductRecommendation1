// src/context/AuthContext.js
import { createContext, useContext, useState, useCallback } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user,  setUser]  = useState(
        JSON.parse(localStorage.getItem("user")) || null
    )
    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    )
    const [error, setError] = useState(null)

    const login = useCallback((userData, tokenData) => {
        setUser(userData)
        setToken(tokenData)
        setError(null)
        localStorage.setItem("user",  JSON.stringify(userData))
        localStorage.setItem("token", tokenData)
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        setError(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }, [])

    const setAuthError = useCallback((errorMessage) => {
        setError(errorMessage)
    }, [])

    return (
        <AuthContext.Provider value={{ user, token, error, login, logout, setAuthError }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook — use this in any component to access auth
export const useAuth = () => useContext(AuthContext)