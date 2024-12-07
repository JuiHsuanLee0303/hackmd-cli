import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs/promises";
import api from "../utils/api.js";

export default async function edit(noteId, options) {
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
          message: "Select a note to edit:",
          choices,
        },
      ]);
      noteId = selectedNote;
    }

    // Get current note data
    const note = await api.getNote(noteId);
    let noteData = {};

    if (options.file) {
      // Edit from file
      try {
        const content = await fs.readFile(options.file, "utf8");
        noteData.content = content;
      } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
    } else if (
      !options.title &&
      !options.content &&
      !options.readPermission &&
      !options.writePermission &&
      !options.commentPermission
    ) {
      // Interactive mode
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "Enter new title (leave empty to keep current):",
          default: note.title,
        },
        {
          type: "editor",
          name: "content",
          message: "Edit content:",
          default: note.content,
        },
        {
          type: "list",
          name: "readPermission",
          message: "Select read permission:",
          choices: ["owner", "signed_in", "guest"],
          default: note.readPermission,
        },
        {
          type: "list",
          name: "writePermission",
          message: "Select write permission:",
          choices: ["owner", "signed_in"],
          default: note.writePermission,
        },
        {
          type: "list",
          name: "commentPermission",
          message: "Select comment permission:",
          choices: ["disabled", "owner", "signed_in", "guest"],
          default: note.commentPermission,
        },
      ]);

      noteData = answers;
    }

    // Merge command line options
    noteData = {
      title: options.title || noteData.title || note.title,
      content: options.content || noteData.content || note.content,
      readPermission:
        options.readPermission ||
        noteData.readPermission ||
        note.readPermission,
      writePermission:
        options.writePermission ||
        noteData.writePermission ||
        note.writePermission,
      commentPermission:
        options.commentPermission ||
        noteData.commentPermission ||
        note.commentPermission,
    };

    await api.updateNote(noteId, noteData);
    console.log(chalk.green("✓ Note updated successfully"));
  } catch (error) {
    console.error(chalk.red("Error editing note:"), error.message);
    process.exit(1);
  }
}
