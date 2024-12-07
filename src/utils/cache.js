import fs from "fs/promises";
import path from "path";
import config from "../config/index.js";

class NoteCache {
  constructor() {
    this.cachePath = path.join(
      path.dirname(config.get("tokenPath")),
      "notes.json"
    );
  }

  async saveNotes(notes) {
    try {
      const cacheData = notes.map((note) => ({
        id: note.id,
        title: note.title,
        lastChangeAt: note.lastChangeAt,
      }));
      await fs.writeFile(this.cachePath, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.error("Failed to save notes cache:", error);
    }
  }

  async getNotes() {
    try {
      const data = await fs.readFile(this.cachePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async selectNote(message = "Select a note:") {
    const inquirer = (await import("inquirer")).default;
    const notes = await this.getNotes();

    if (notes.length === 0) {
      throw new Error('No cached notes found. Please run "hackmd list" first.');
    }

    const { noteId } = await inquirer.prompt([
      {
        type: "list",
        name: "noteId",
        message,
        choices: [
          ...notes.map((note) => ({
            name: `${note.title} (${note.id})`,
            value: note.id,
          })),
          new inquirer.Separator(),
          {
            name: "Enter ID manually",
            value: "manual",
          },
        ],
      },
    ]);

    if (noteId === "manual") {
      const { manualId } = await inquirer.prompt([
        {
          type: "input",
          name: "manualId",
          message: "Enter note ID:",
          validate: (input) => input.length > 0 || "Note ID cannot be empty",
        },
      ]);
      return manualId;
    }

    return noteId;
  }
}

export default new NoteCache();
