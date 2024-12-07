import inquirer from "inquirer";
import chalk from "chalk";
import { setToken } from "../config/api.js";
import api from "../utils/api.js";

export default async function login() {
  const questions = [
    {
      type: "password",
      name: "token",
      message: "Please enter your HackMD API token:",
      validate: (value) => {
        if (!value) {
          return "Please enter your API token";
        }
        return true;
      },
    },
  ];

  try {
    const { token } = await inquirer.prompt(questions);

    // Save token
    setToken(token);

    // Test token
    await api.getNotes();

    console.log(chalk.green("✓ Successfully logged in to HackMD"));
  } catch (error) {
    console.error(chalk.red("Error logging in:"), error.message);
    process.exit(1);
  }
}
