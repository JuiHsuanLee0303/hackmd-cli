import chalk from "chalk";
import { clearToken } from "../config/api.js";

export default async function logout() {
  try {
    clearToken();
    console.log(chalk.green("✓ Successfully logged out"));
  } catch (error) {
    console.error(chalk.red("Error logging out:"), error.message);
    process.exit(1);
  }
}
