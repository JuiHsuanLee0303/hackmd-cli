import chalk from "chalk";
import api from "../utils/api.js";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function padEnd(str, length) {
  return String(str).padEnd(length);
}

// Remove ANSI color codes
function stripColor(str) {
  return str.replace(/\x1B\[\d+m/g, "");
}

function getColumnWidths(notes, options) {
  const widths = {
    title: 0,
    id: 0,
    author: 0,
    created: 0,
    modified: 0,
    read: 0,
    write: 0,
    comment: 0,
  };

  notes.forEach((note) => {
    if (options.title || !Object.keys(options).length) {
      widths.title = Math.max(widths.title, note.title.length);
    }
    if (options.id || !Object.keys(options).length) {
      widths.id = Math.max(widths.id, note.id.length);
    }
    if (options.author) {
      widths.author = Math.max(
        widths.author,
        (note.user?.name || "Anonymous").length
      );
    }
    if (options.created) {
      widths.created = Math.max(
        widths.created,
        formatDate(note.createdAt).length
      );
    }
    if (options.modified) {
      widths.modified = Math.max(
        widths.modified,
        formatDate(note.lastChangedAt).length
      );
    }
    if (options.read) {
      widths.read = Math.max(widths.read, note.readPermission.length);
    }
    if (options.write) {
      widths.write = Math.max(widths.write, note.writePermission.length);
    }
    if (options.comment) {
      widths.comment = Math.max(widths.comment, note.commentPermission.length);
    }
  });

  // Add padding and label lengths
  if (options.title || !Object.keys(options).length)
    widths.title = Math.max(widths.title + 2, "Title".length + 2);
  if (options.id || !Object.keys(options).length)
    widths.id = Math.max(widths.id + 2, "ID".length + 2);
  if (options.author)
    widths.author = Math.max(widths.author + 2, "Author".length + 2);
  if (options.created)
    widths.created = Math.max(widths.created + 2, "Created".length + 2);
  if (options.modified)
    widths.modified = Math.max(widths.modified + 2, "Modified".length + 2);
  if (options.read) widths.read = Math.max(widths.read + 2, "Read".length + 2);
  if (options.write)
    widths.write = Math.max(widths.write + 2, "Write".length + 2);
  if (options.comment)
    widths.comment = Math.max(widths.comment + 2, "Comment".length + 2);

  return widths;
}

export default async function list(options) {
  try {
    const notes = await api.getNotes();

    if (notes.length === 0) {
      console.log(chalk.yellow("No notes found"));
      return;
    }

    if (options.verbose) {
      notes.forEach((note) => {
        console.log(chalk.cyan("\nNote Details:"));
        console.log(chalk.white("Title:"), note.title);
        console.log(chalk.white("ID:"), note.id);
        console.log(chalk.white("Author:"), note.user?.name || "Anonymous");
        console.log(chalk.white("Created:"), formatDate(note.createdAt));
        console.log(
          chalk.white("Last Modified:"),
          formatDate(note.lastChangedAt)
        );
        console.log(chalk.white("Read Permission:"), note.readPermission);
        console.log(chalk.white("Write Permission:"), note.writePermission);
        console.log(chalk.white("Comment Permission:"), note.commentPermission);
        console.log(chalk.gray("---"));
      });
      return;
    }

    const widths = getColumnWidths(notes, options);
    const columns = [];
    const separator = "  ";

    // Build header
    if (options.title || !Object.keys(options).length) {
      columns.push(chalk.cyan(padEnd("Title", widths.title)));
    }
    if (options.id || !Object.keys(options).length) {
      columns.push(chalk.cyan(padEnd("ID", widths.id)));
    }
    if (options.author) {
      columns.push(chalk.cyan(padEnd("Author", widths.author)));
    }
    if (options.created) {
      columns.push(chalk.cyan(padEnd("Created", widths.created)));
    }
    if (options.modified) {
      columns.push(chalk.cyan(padEnd("Modified", widths.modified)));
    }
    if (options.read) {
      columns.push(chalk.cyan(padEnd("Read", widths.read)));
    }
    if (options.write) {
      columns.push(chalk.cyan(padEnd("Write", widths.write)));
    }
    if (options.comment) {
      columns.push(chalk.cyan(padEnd("Comment", widths.comment)));
    }

    // Print header
    if (columns.length > 0) {
      console.log(columns.join(separator));
      console.log(
        columns.map((col) => "-".repeat(stripColor(col).length)).join(separator)
      );
    }

    // Print rows
    notes.forEach((note) => {
      const row = [];
      if (options.title || !Object.keys(options).length) {
        row.push(chalk.white(padEnd(note.title, widths.title)));
      }
      if (options.id || !Object.keys(options).length) {
        row.push(chalk.gray(padEnd(note.id, widths.id)));
      }
      if (options.author) {
        row.push(
          chalk.blue(padEnd(note.user?.name || "Anonymous", widths.author))
        );
      }
      if (options.created) {
        row.push(
          chalk.yellow(padEnd(formatDate(note.createdAt), widths.created))
        );
      }
      if (options.modified) {
        row.push(
          chalk.green(padEnd(formatDate(note.lastChangedAt), widths.modified))
        );
      }
      if (options.read) {
        row.push(chalk.magenta(padEnd(note.readPermission, widths.read)));
      }
      if (options.write) {
        row.push(chalk.cyan(padEnd(note.writePermission, widths.write)));
      }
      if (options.comment) {
        row.push(chalk.red(padEnd(note.commentPermission, widths.comment)));
      }
      console.log(row.join(separator));
    });
  } catch (error) {
    console.error(chalk.red("Error listing notes:"), error.message);
    process.exit(1);
  }
}
