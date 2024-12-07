import chalk from "chalk";
import ora from "ora";
import api from "../utils/api.js";
import noteCache from "../utils/cache.js";

async function fetchNote(noteId, options = {}) {
  const spinner = ora("Fetching notes...").start();

  try {
    // Fetch all notes
    if (options.all || !noteId) {
      const response = await api.get("/notes");
      await noteCache.saveNotes(response);
      spinner.succeed(
        chalk.green("All notes fetched and cached successfully!")
      );

      if (response && response.length > 0) {
        console.log(chalk.green("\nNote List:"));
        response.forEach((note, index) => {
          console.log(chalk.cyan(`\n${index + 1}. ${note.title}`));
          console.log(chalk.gray(`   ID: ${note.id}`));
          console.log(
            chalk.gray(
              `   Created: ${new Date(note.createdAt).toLocaleString()}`
            )
          );
          console.log(
            chalk.gray(
              `   Updated: ${new Date(note.lastChangeAt).toLocaleString()}`
            )
          );
        });
      } else {
        console.log(chalk.yellow("\nNo notes found"));
      }
      return;
    }

    // Fetch single note
    try {
      const note = await api.get(`/notes/${noteId}`);
      spinner.succeed(chalk.green("Note fetched successfully!"));

      console.log(chalk.cyan("\nNote Details:"));
      console.log(chalk.white("Title:", note.title));
      console.log(chalk.gray("ID:", note.id));
      console.log(
        chalk.gray("Created:", new Date(note.createdAt).toLocaleString())
      );
      console.log(
        chalk.gray("Updated:", new Date(note.lastChangeAt).toLocaleString())
      );
      console.log(chalk.white("\nContent:"));
      console.log(note.content);

      // Save this single note to cache as well
      const cachedNotes = await noteCache.getNotes();
      const updatedNotes = cachedNotes.filter((n) => n.id !== note.id);
      updatedNotes.push({
        id: note.id,
        title: note.title,
        lastChangeAt: note.lastChangeAt,
      });
      await noteCache.saveNotes(updatedNotes);
    } catch (error) {
      spinner.fail(chalk.red("Failed to fetch note: " + error.message));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(chalk.red("Error: " + error.message));
    process.exit(1);
  }
}

export default fetchNote;
