import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import api from "../utils/api.js";
import noteCache from "../utils/cache.js";

async function edit(noteId) {
  try {
    // If no noteId provided, show selection
    if (!noteId) {
      noteId = await noteCache.selectNote("Select note to edit:");
    }

    // Get note information
    const spinner = ora("Fetching note...").start();
    let note;

    try {
      note = await api.get(`/notes/${noteId}`);
      spinner.succeed(chalk.green("Note fetched successfully!"));
    } catch (error) {
      spinner.fail(chalk.red("Failed to fetch note: " + error.message));
      process.exit(1);
    }

    // Display current note information
    console.log(chalk.cyan("\nCurrent Note:"));
    console.log(chalk.gray(`Title: ${note.title}`));
    console.log(
      chalk.gray(
        `Last Updated: ${new Date(note.lastChangeAt).toLocaleString()}`
      )
    );

    // Ask for content to edit
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter new title (press Enter to keep current):",
        default: note.title,
      },
      {
        type: "editor",
        name: "content",
        message: "Edit note content:",
        default: note.content,
      },
    ]);

    // If content hasn't changed, ask for confirmation
    if (answers.title === note.title && answers.content === note.content) {
      const confirm = await inquirer.prompt([
        {
          type: "confirm",
          name: "update",
          message: "No changes detected. Update anyway?",
          default: false,
        },
      ]);

      if (!confirm.update) {
        console.log(chalk.yellow("Update cancelled"));
        return;
      }
    }

    // Update note
    spinner.text = "Updating note...";
    spinner.start();

    try {
      await api.patch(`/notes/${noteId}`, {
        title: answers.title,
        content: answers.content,
      });

      spinner.succeed(chalk.green("Note updated successfully!"));
    } catch (error) {
      spinner.fail(chalk.red("Failed to update note: " + error.message));
    }
  } catch (error) {
    console.error(chalk.red("Error: " + error.message));
    process.exit(1);
  }
}

export default edit;
