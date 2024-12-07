import chalk from "chalk";
import path from "path";
import fs from "fs/promises";
import { getRemotes, readNote } from "../utils/local.js";
import api from "../utils/api.js";

// handle file name, remove extension and path
function normalizeName(name) {
  // remove extension
  const basename = path.basename(name, path.extname(name));
  // remove path separator
  return basename.replace(/[\/\\]/g, "_");
}

// check if the file exists
async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export default async function push(name) {
  try {
    const remotes = await getRemotes();

    if (name) {
      // check if the file exists
      const filePath = path.resolve(name);
      const fileExists = await checkFileExists(filePath);

      if (!fileExists) {
        throw new Error(`File '${name}' not found`);
      }

      // read file content
      const content = await fs.readFile(filePath, "utf8");

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
          chalk.yellow(`Pushing note '${normalizedName}' (${noteId})`)
        );
        await api.updateNote(noteId, { content });
        console.log(
          chalk.green(`✓ Pushed note '${normalizedName}' (${noteId})`)
        );
      } catch (error) {
        console.error(
          chalk.red(`Error pushing note '${normalizedName}':`, error.message)
        );
        process.exit(1);
      }
    } else {
      // Push all remotes
      if (Object.keys(remotes).length === 0) {
        console.log(chalk.yellow("No remotes found"));
        return;
      }

      let hasErrors = false;
      Object.entries(remotes).forEach(async ([remoteName, noteId]) => {
        const filePath = path.resolve(`${remoteName}.md`);
        const fileExists = await checkFileExists(filePath);
        if (!fileExists) {
          console.log(
            chalk.yellow(`Skipping '${remoteName}': File not found locally`)
          );
          return;
        }

        const content = await fs.readFile(filePath, "utf8");
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
            chalk.yellow(`Pushing note '${normalizedName}' (${updatedNoteId})`)
          );
          await api.updateNote(updatedNoteId, { content });
          console.log(
            chalk.green(`✓ Pushed note '${normalizedName}' (${updatedNoteId})`)
          );
        } catch (error) {
          console.error(
            chalk.red(`Error pushing note '${normalizedName}':`, error.message)
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
    console.error(chalk.red("Error pushing notes:"), error.message);
    process.exit(1);
  }
}
