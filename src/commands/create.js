import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import api from "../utils/api.js";
import config from "../config/index.js";

async function create(options) {
  try {
    let { title, content } = options;

    // If title or content is not provided, get them through interactive prompts
    if (!title || !content) {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "Enter note title:",
          when: !title,
          validate: (input) => input.length > 0 || "Title cannot be empty",
        },
        {
          type: "editor",
          name: "content",
          message: "Enter note content:",
          when: !content,
          validate: (input) => input.length > 0 || "Content cannot be empty",
        },
      ]);

      title = title || answers.title;
      content = content || answers.content;
    }

    const spinner = ora("Creating note...").start();

    try {
      const response = await api.post("/notes", {
        title,
        content,
      });

      spinner.succeed(chalk.green("Note created successfully!"));
      console.log(chalk.cyan(`\nNote ID: ${response.id}`));
      console.log(chalk.cyan(`Note Title: ${response.title}`));
      console.log(chalk.cyan(`Note content: ${response.content}`));
    } catch (error) {
      spinner.fail(chalk.red("Failed to create note: " + error.message));
    }
  } catch (error) {
    console.error(chalk.red("Error: " + error.message));
    process.exit(1);
  }
}

export default create;
