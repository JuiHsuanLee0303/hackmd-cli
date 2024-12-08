import chalk from "chalk";
import api from "../utils/api.js";

export default async function fetch(noteId, options) {
  console.log(
    chalk.red(
      "This command will be deprecated in the future. Please use `hackmd list -v` instead."
    )
  );
  try {
    if (options.all) {
      // Fetch all notes
      const notes = await api.getNotes();
      console.log(chalk.green(`✓ Fetched ${notes.length} notes`));
      notes.forEach((note) => {
        console.log(chalk.white("\nTitle:"), note.title);
        console.log(chalk.gray("ID:"), note.id);
        console.log(
          chalk.gray("Last Modified:"),
          new Date(note.lastChangedAt).toLocaleString()
        );
      });
    } else if (noteId) {
      // Fetch single note
      const note = await api.getNote(noteId);
      console.log(chalk.green("✓ Note fetched successfully"));
      console.log(chalk.white("\nTitle:"), note.title);
      console.log(chalk.gray("ID:"), note.id);
      console.log(chalk.gray("Content:"), note.content);
      console.log(
        chalk.gray("Last Modified:"),
        new Date(note.lastChangedAt).toLocaleString()
      );
    } else {
      console.error(
        chalk.red("Error: Please provide a note ID or use --all flag")
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("Error fetching notes:"), error.message);
    process.exit(1);
  }
}
