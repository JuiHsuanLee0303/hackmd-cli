import axios from "axios";
import chalk from "chalk";
import { API_BASE_URL, getToken } from "../config/api.js";

const api = axios.create({
  baseURL: API_BASE_URL,
});

function checkToken() {
  const token = getToken();
  if (!token) {
    console.error(chalk.red("Error: API token not found"));
    console.log(chalk.cyan("\nTo use this CLI, you need to:"));
    console.log(
      chalk.white("1. Go to"),
      chalk.yellow("https://hackmd.io/settings#api")
    );
    console.log(chalk.white("2. Create a new API token"));
    console.log(
      chalk.white("3. Run"),
      chalk.green("hackmd login"),
      chalk.white("and enter your token")
    );
    process.exit(1);
  }
  return token;
}

// Add token to requests
api.interceptors.request.use((config) => {
  const token = checkToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error(chalk.red("Error: Invalid or expired API token"));
          console.log(chalk.cyan("\nPlease:"));
          console.log(
            chalk.white("1. Check your token at"),
            chalk.yellow("https://hackmd.io/settings#api")
          );
          console.log(
            chalk.white("2. Run"),
            chalk.green("hackmd login"),
            chalk.white("with a valid token")
          );
          process.exit(1);
        case 403:
          throw new Error("You don't have permission to perform this action");
        case 404:
          throw new Error("The requested resource was not found");
        default:
          throw new Error(error.response.data?.message || error.message);
      }
    }
    throw error;
  }
);

export async function getNotes() {
  const response = await api.get("/notes");
  return response.data;
}

export async function getNote(noteId) {
  const response = await api.get(`/notes/${noteId}`);
  return response.data;
}

export async function createNote(data) {
  const response = await api.post("/notes", data);
  return response.data;
}

export async function updateNote(noteId, data) {
  const response = await api.patch(`/notes/${noteId}`, data);
  return response.data;
}

export async function deleteNote(noteId) {
  await api.delete(`/notes/${noteId}`);
}

export default {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
