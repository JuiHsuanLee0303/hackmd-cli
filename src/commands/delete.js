import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import api from "../utils/api.js";
import noteCache from "../utils/cache.js";

async function deleteNote(noteId) {
  try {
    // If no noteId provided, show selection
    if (!noteId) {
      noteId = await noteCache.selectNote("Select note to delete:");
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

    // Display note information and confirm deletion
    console.log(chalk.cyan("\nNote to delete:"));
    console.log(chalk.gray(`Title: ${note.title}`));
    console.log(
      chalk.gray(`Created: ${new Date(note.createdAt).toLocaleString()}`)
    );

    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "delete",
        message:
          "Are you sure you want to delete this note? This action cannot be undone!",
        default: false,
      },
    ]);

    if (!confirm.delete) {
      console.log(chalk.yellow("Deletion cancelled"));
      return;
    }

    spinner.text = "Deleting note...";
    spinner.start();

    try {
      await api.delete(`/notes/${noteId}`);
      spinner.succeed(chalk.green("Note deleted successfully!"));

      // Update cache after deletion
      const notes = await noteCache.getNotes();
      const updatedNotes = notes.filter((n) => n.id !== noteId);
      await noteCache.saveNotes(updatedNotes);
    } catch (error) {
      spinner.fail(chalk.red("Failed to delete note: " + error.message));
    }
  } catch (error) {
    console.error(chalk.red("Error: " + error.message));
    process.exit(1);
  }
}

export default deleteNote;
