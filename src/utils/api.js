import axios from "axios";
import fs from "fs/promises";
import config from "../config/index.js";
import chalk from "chalk";

const api = axios.create({
  baseURL: config.get("apiUrl"),
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  async (reqConfig) => {
    // Skip token check for login verification
    if (reqConfig.headers.Authorization) {
      return reqConfig;
    }

    try {
      const tokenPath = config.get("tokenPath");
      const token = await fs.readFile(tokenPath, "utf8");
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token.trim()}`;
        return reqConfig;
      }
    } catch (error) {
      // If token file doesn't exist or can't be read
      throw new Error(
        "Authentication required. Please run 'hackmd login' first."
      );
    }

    throw new Error("No valid token found. Please run 'hackmd login' first.");
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error(
          "Token invalid or expired. Please run 'hackmd login' to refresh your token."
        );
      }
      throw new Error(
        error.response?.data?.message || error.message || "Request failed"
      );
    }
    throw error;
  }
);

export default api;
