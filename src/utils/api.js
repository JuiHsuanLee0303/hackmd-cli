import axios from "axios";
import fs from "fs/promises";
import config from "../config/index.js";
import remoteManager from "./remotes.js";

class ApiClient {
  constructor() {
    this.defaultConfig = {
      timeout: 10000,
    };
    this.clients = new Map();
  }

  async getClient(remoteName = "origin") {
    if (this.clients.has(remoteName)) {
      return this.clients.get(remoteName);
    }

    try {
      const remote = await remoteManager.getRemote(remoteName);
      const client = axios.create({
        ...this.defaultConfig,
        baseURL: remote.url,
      });

      // Request interceptor
      client.interceptors.request.use(
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
            throw new Error(
              "Authentication required. Please run 'hackmd login' first."
            );
          }

          throw new Error(
            "No valid token found. Please run 'hackmd login' first."
          );
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor
      client.interceptors.response.use(
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

      this.clients.set(remoteName, client);
      return client;
    } catch (error) {
      throw new Error(
        `Failed to initialize API client for remote '${remoteName}': ${error.message}`
      );
    }
  }

  async get(path, config = {}, remoteName = "origin") {
    const client = await this.getClient(remoteName);
    return client.get(path, config);
  }

  async post(path, data = {}, config = {}, remoteName = "origin") {
    const client = await this.getClient(remoteName);
    return client.post(path, data, config);
  }

  async patch(path, data = {}, config = {}, remoteName = "origin") {
    const client = await this.getClient(remoteName);
    return client.patch(path, data, config);
  }

  async delete(path, config = {}, remoteName = "origin") {
    const client = await this.getClient(remoteName);
    return client.delete(path, config);
  }
}

export default new ApiClient();
