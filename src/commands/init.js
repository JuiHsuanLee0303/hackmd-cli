import chalk from "chalk";
import { initRepo } from "../utils/local.js";

export default async function init() {
  try {
    await initRepo();
    console.log(chalk.green("✓ Initialized empty HackMD repository"));
  } catch (error) {
    console.error(chalk.red("Error initializing repository:"), error.message);
    process.exit(1);
  }
}
