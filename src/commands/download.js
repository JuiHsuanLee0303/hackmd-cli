import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import api from "../utils/api.js";

export default async function download(noteId, options) {
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
          message: "Select a note to download:",
          choices,
        },
      ]);
      noteId = selectedNote;
    }

    // Get note
    const note = await api.getNote(noteId);

    // Determine output path
    let outputPath = options.output;
    if (!outputPath) {
      // Use note title as filename if no output path specified
      const filename = `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
      outputPath = path.join(process.cwd(), filename);
    }

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(outputPath, note.content);
    console.log(chalk.green("✓ Note downloaded successfully"));
    console.log(chalk.white("Saved to:"), outputPath);
  } catch (error) {
    console.error(chalk.red("Error downloading note:"), error.message);
    process.exit(1);
  }
}
