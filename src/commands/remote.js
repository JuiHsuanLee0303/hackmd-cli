import chalk from "chalk";
import {
  getRemotes,
  addRemote as addRemoteToLocal,
  removeRemote as removeRemoteFromLocal,
} from "../utils/local.js";
import api from "../utils/api.js";

export async function add(name, noteId) {
  console.log(chalk.cyan(`Adding remote '${name}' -> ${noteId}`));
  try {
    // Verify note exists
    await api.getNote(noteId);
    console.log(chalk.green(`✓ Verified remote note '${noteId}'`));

    // Add remote
    const normalizedName = await addRemoteToLocal(name, noteId);
    console.log(chalk.green(`✓ Added remote '${normalizedName}' -> ${noteId}`));
  } catch (error) {
    console.error(chalk.red("Error adding remote:"), error.message);
    process.exit(1);
  }
}

export async function remove(name) {
  try {
    await removeRemoteFromLocal(name);
    console.log(chalk.green(`✓ Removed remote '${name}'`));
  } catch (error) {
    console.error(chalk.red("Error removing remote:"), error.message);
    process.exit(1);
  }
}

export async function list(options) {
  try {
    const remotes = await getRemotes();

    if (Object.keys(remotes).length === 0) {
      console.log(chalk.yellow("No remotes found"));
      return;
    }

    if (options.verbose) {
      for (const [name, noteId] of Object.entries(remotes)) {
        console.log(chalk.cyan("\nRemote Details:"));
        console.log(chalk.white("Name:"), name);
        console.log(chalk.white("Note ID:"), noteId);

        try {
          const note = await api.getNote(noteId);
          console.log(chalk.white("Title:"), note.title);
          console.log(
            chalk.white("Last Modified:"),
            new Date(note.lastChangedAt).toLocaleString()
          );
        } catch (error) {
          console.log(chalk.red("Note details unavailable"));
        }

        console.log(chalk.gray("---"));
      }
    } else {
      for (const [name, noteId] of Object.entries(remotes)) {
        console.log(chalk.white(name), chalk.gray(`-> ${noteId}`));
      }
    }
  } catch (error) {
    console.error(chalk.red("Error listing remotes:"), error.message);
    process.exit(1);
  }
}

export default {
  add,
  remove,
  list,
};
