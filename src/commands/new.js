import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs/promises";
import api from "../utils/api.js";

export default async function newNote(options) {
  try {
    let noteData = {};

    if (options.file) {
      // Create from file
      try {
        const content = await fs.readFile(options.file, "utf8");
        noteData.content = content;
        // Use filename as title if not specified
        if (!options.title) {
          noteData.title = options.file.replace(/\.[^/.]+$/, "");
        }
      } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
      }
    }

    // If no file or missing required fields, prompt user
    if (!options.file || !noteData.title) {
      const questions = [];

      if (!noteData.title && !options.title) {
        questions.push({
          type: "input",
          name: "title",
          message: "Enter note title:",
          validate: (value) => value.length > 0 || "Title cannot be empty",
        });
      }

      if (!noteData.content && !options.content) {
        questions.push({
          type: "editor",
          name: "content",
          message: "Enter note content:",
          validate: (value) => value.length > 0 || "Content cannot be empty",
        });
      }

      const answers = await inquirer.prompt(questions);
      noteData = { ...noteData, ...answers };
    }

    // Merge command line options
    noteData = {
      title: options.title || noteData.title,
      content: options.content || noteData.content,
      readPermission: options.readPermission || "owner",
      writePermission: options.writePermission || "owner",
      commentPermission: options.commentPermission || "disabled",
    };

    const note = await api.createNote(noteData);
    console.log(chalk.green("✓ Note created successfully"));
    console.log(chalk.white("Title:"), note.title);
    console.log(chalk.white("ID:"), note.id);
  } catch (error) {
    console.error(chalk.red("Error creating note:"), error.message);
    process.exit(1);
  }
}
