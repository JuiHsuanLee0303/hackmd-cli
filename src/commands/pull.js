import chalk from "chalk";
import path from "path";
import { getRemotes, saveNote } from "../utils/local.js";
import api from "../utils/api.js";

// handle file name, remove extension and path
function normalizeName(name) {
  // remove extension
  const basename = path.basename(name, path.extname(name));
  // remove path separator
  return basename.replace(/[\/\\]/g, "_");
}

export default async function pull(name) {
  try {
    const remotes = await getRemotes();

    if (name) {
      // normalize name
      const normalizedName = normalizeName(name);

      // check if there is a corresponding remote
      if (!remotes[normalizedName]) {
        console.log(chalk.yellow(`No remote found for '${normalizedName}'`));
        console.log(chalk.cyan("To add a remote, use:"));
        console.log(
          chalk.white(`hackmd remote add ${normalizedName} <note-id>`)
        );
        process.exit(1);
      }

      const noteId = remotes[normalizedName];
      try {
        console.log(
          chalk.yellow(`Pulling note '${normalizedName}' (${noteId})`)
        );
        const note = await api.getNote(noteId);
        await saveNote(normalizedName, note.content);
        console.log(
          chalk.green(`✓ Pulled note '${normalizedName}' (${noteId})`)
        );
      } catch (error) {
        console.error(
          chalk.red(`Error pulling note '${normalizedName}':`, error.message)
        );
        process.exit(1);
      }
    } else {
      // pull all remotes
      if (Object.keys(remotes).length === 0) {
        console.log(chalk.yellow("No remotes found"));
        return;
      }

      let hasErrors = false;
      Object.entries(remotes).forEach(async ([remoteName, noteId]) => {
        const normalizedName = normalizeName(remoteName);

        if (!remotes[normalizedName]) {
          console.log(chalk.yellow(`No remote found for '${normalizedName}'`));
          console.log(chalk.cyan("To add a remote, use:"));
          console.log(
            chalk.white(`hackmd remote add ${normalizedName} <note-id>`)
          );
          process.exit(1);
        }

        const updatedNoteId = remotes[normalizedName];

        try {
          console.log(
            chalk.yellow(`Pulling note '${normalizedName}' (${updatedNoteId})`)
          );
          const note = await api.getNote(updatedNoteId);
          await saveNote(normalizedName, note.content);
          console.log(
            chalk.green(`✓ Pulled note '${normalizedName}' (${updatedNoteId})`)
          );
        } catch (error) {
          console.error(
            chalk.red(`Error pulling note '${normalizedName}':`, error.message)
          );
          hasErrors = true;
        }
      });

      // if there is any error, exit with non-zero status
      if (hasErrors) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(chalk.red("Error pulling notes:"), error.message);
    process.exit(1);
  }
}
