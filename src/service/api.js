import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

api.interceptors.request.use(
    async (config) => {
        console.log("Entering interceptor configuration");
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        console.debug("Returning interceptor configuration");
        return config;
    },
    (error) => {
        console.error("Error in interceptor configuration", error);
        return Promise.reject(error);
    }
);

export default api;