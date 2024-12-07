import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs/promises";
import path from "path";
import config from "../config/index.js";
import api from "../utils/api.js";

async function verifyToken(token) {
  try {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await api.get("/me");
    return true;
  } catch (error) {
    return false;
  }
}

async function login(options) {
  try {
    const defaultTokenPath = config.get("tokenPath");
    let token;
    let spinner;

    // Try to read and verify the existing token
    try {
      spinner = ora("Checking existing token...").start();
      token = await fs.readFile(defaultTokenPath, "utf8");

      if (await verifyToken(token.trim())) {
        spinner.succeed(chalk.green("Existing token verified successfully!"));
        return;
      } else {
        spinner.fail(
          chalk.yellow("Existing token is invalid, please re-enter")
        );
      }
    } catch (error) {
      if (spinner) {
        spinner.stop();
      }
      console.log(
        chalk.yellow("\nNo existing token found, please enter a new one")
      );
    }

    console.log(
      chalk.cyan(
        "\nPlease create an API token at https://hackmd.io/settings#api"
      )
    );

    // Ask for token and storage location
    const answers = await inquirer.prompt([
      {
        type: "password",
        name: "token",
        message: "Enter your API token:",
        validate: (input) => input.length > 0 || "Token cannot be empty",
      },
      {
        type: "input",
        name: "tokenPath",
        message: "Enter the path to store the token:",
        default: defaultTokenPath,
        validate: (input) => input.length > 0 || "Path cannot be empty",
      },
    ]);

    spinner = ora("Verifying token...").start();

    try {
      if (await verifyToken(answers.token)) {
        // Token verified successfully, save to file
        const tokenDir = path.dirname(answers.tokenPath);
        await fs.mkdir(tokenDir, { recursive: true });
        await fs.writeFile(answers.tokenPath, answers.token, { mode: 0o600 });

        // Update token path in config
        config.set("tokenPath", answers.tokenPath);

        spinner.succeed(chalk.green("Token verified and saved successfully!"));
        console.log(chalk.gray(`Token saved to: ${answers.tokenPath}`));
      } else {
        spinner.fail(
          chalk.red("Token verification failed, please check if it's correct")
        );
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red("Error during verification: " + error.message));
      process.exit(1);
    }
  } catch (error) {
    if (spinner) {
      spinner.fail(chalk.red("Error: " + error.message));
    } else {
      console.error(chalk.red("Error: " + error.message));
    }
    process.exit(1);
  }
}

export default login;
