// src/services/api.js
// Central place for all API calls with error handling.
// Components never call fetch/axios directly — they use these functions.

import axios from "axios"

const NODE_API = process.env.REACT_APP_API_URL || "http://localhost:4000"

// ── Axios Instance with Interceptors ─────────────────────────────────────────

const axiosInstance = axios.create({ baseURL: NODE_API })

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — logout
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

// ── Helper Function for Error Handling ───────────────────────────────────────

const handleError = (error, context = "Request") => {
    const message = error.response?.data?.error || error.message || `${context} failed`
    console.error(`${context} error:`, message)
    throw new Error(message)
}

// ── Demand Prediction ────────────────────────────────────────────────────────

export const predictDemand = async (price) => {
    try {
        const response = await axiosInstance.post("/ml/predict", { price })
        return response.data
    } catch (error) {
        handleError(error, "Demand prediction")
    }
}

export const predictBatch = async (prices) => {
    try {
        const response = await axiosInstance.post("/ml/predict/batch", { prices })
        return response.data
    } catch (error) {
        handleError(error, "Batch prediction")
    }
}

// ── Recommendations ─────────────────────────────────────────────────────────

export const recommendForUser = async (customerName) => {
    try {
        const response = await axiosInstance.post("/ml/recommend/user", {
            customer_name: customerName
        })
        return response.data
    } catch (error) {
        handleError(error, "User recommendations")
    }
}

export const recommendSimilarProducts = async (productCode) => {
    try {
        const response = await axiosInstance.post("/ml/recommend/product", {
            product_code: productCode
        })
        return response.data
    } catch (error) {
        handleError(error, "Product recommendations")
    }
}

// ── Products & Customers ───────────────────────────────────────────────────

export const getAllProducts = async () => {
    try {
        const response = await axiosInstance.get("/products")
        return response.data
    } catch (error) {
        handleError(error, "Fetch products")
    }
}

export const getLaptops = async () => {
    try {
        const response = await axiosInstance.get("/products/filter/laptops")
        return response.data
    } catch (error) {
        handleError(error, "Fetch laptops")
    }
}

export const getPhones = async () => {
    try {
        const response = await axiosInstance.get("/products/filter/phones")
        return response.data
    } catch (error) {
        handleError(error, "Fetch phones")
    }
}

export const getAllCustomers = async () => {
    try {
        const response = await axiosInstance.get("/customers")
        return response.data
    } catch (error) {
        handleError(error, "Fetch customers")
    }
}

export const getModelInfo = async () => {
    try {
        const response = await axiosInstance.get("/ml/model/info")
        return response.data
    } catch (error) {
        handleError(error, "Fetch model info")
    }
}