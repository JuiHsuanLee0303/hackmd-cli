import chalk from "chalk";
import inquirer from "inquirer";
import api from "../utils/api.js";

export default async function deleteNote(noteId) {
  try {
    if (!noteId) {
      // Interactive mode: list notes and let user choose
      const notes = await api.getNotes();
      const choices = notes.map((note) => ({
        name: `${note.title} (${note.id})`,
        value: note.id,
      }));

      const { selectedNote } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedNote",
          message: "Select a note to delete:",
          choices,
        },
      ]);
      noteId = selectedNote;
    }

    // Get note info for confirmation
    const note = await api.getNote(noteId);

    // Confirm deletion
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete note "${note.title}" (${note.id})?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Operation cancelled"));
      return;
    }

    await api.deleteNote(noteId);
    console.log(chalk.green("✓ Note deleted successfully"));
  } catch (error) {
    console.error(chalk.red("Error deleting note:"), error.message);
    process.exit(1);
  }
}
