import chalk from "chalk";
import api from "../utils/api.js";

export default async function config() {
  try {
    const user = await api.getMe();
    console.log(chalk.cyan("\nUser Information:"));
    console.log(chalk.white("Name:"), user.name);
    console.log(chalk.white("Email:"), user.email);
    console.log(chalk.white("User ID:"), user.id);
    console.log(chalk.white("Team:"), user.team || "None");
  } catch (error) {
    console.error(chalk.red("Error getting user information:"), error.message);
    process.exit(1);
  }
}
