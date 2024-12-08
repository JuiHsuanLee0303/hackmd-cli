import chalk from "chalk";
import stringWidth from "string-width";
import api from "../utils/api.js";

// truncate text helper function
function truncateText(text, maxLength = 50) {
  if (!text) return "";
  let width = 0;
  let result = "";
  const chars = [...text];

  for (const char of chars) {
    const charWidth = stringWidth(char);
    if (width + charWidth > maxLength) {
      return result + "...";
    }
    width += charWidth;
    result += char;
  }

  return result;
}

// remove ANSI color codes to calculate actual length
function stripAnsi(str) {
  if (!str) return "";
  return str.replace(/\x1B\[\d+m/g, "");
}

// get table column widths
function getColumnWidths(notes, selectedFields) {
  const widths = {
    title: Math.max(4, stringWidth("Title")), // "Title" length
    content: Math.max(7, stringWidth("Content")), // "Content" length
    author: Math.max(6, stringWidth("Author")), // "Author" length
    created: Math.max(7, stringWidth("Created")), // "Created" length
    modified: Math.max(8, stringWidth("Modified")), // "Modified" length
    id: Math.max(2, stringWidth("ID")), // "ID" length
    read: Math.max(4, stringWidth("Read")), // "Read" length
    write: Math.max(5, stringWidth("Write")), // "Write" length
  };

  notes.forEach((note) => {
    if (selectedFields.includes("title")) {
      widths.title = Math.max(
        widths.title,
        stringWidth(truncateText(note.title || ""))
      );
    }
    if (selectedFields.includes("content")) {
      widths.content = Math.max(
        widths.content,
        stringWidth(truncateText(note.content || "", 100))
      );
    }
    if (selectedFields.includes("author")) {
      widths.author = Math.max(widths.author, stringWidth(note.userPath || ""));
    }
    if (selectedFields.includes("created")) {
      widths.created = Math.max(
        widths.created,
        stringWidth(new Date(note.createdAt || Date.now()).toLocaleString())
      );
    }
    if (selectedFields.includes("modified")) {
      widths.modified = Math.max(
        widths.modified,
        stringWidth(new Date(note.lastChangedAt || Date.now()).toLocaleString())
      );
    }
    if (selectedFields.includes("id")) {
      widths.id = Math.max(widths.id, stringWidth(note.id || ""));
    }
    if (selectedFields.includes("read")) {
      widths.read = Math.max(
        widths.read,
        stringWidth(`Read: ${note.readPermission || ""}`)
      );
    }
    if (selectedFields.includes("write")) {
      widths.write = Math.max(
        widths.write,
        stringWidth(`Write: ${note.writePermission || ""}`)
      );
    }
  });

  return widths;
}

// pad text to align
function padText(text, width, align = "left") {
  const textWidth = stringWidth(stripAnsi(text));
  const padding = width - textWidth;
  if (padding <= 0) return text;

  if (align === "right") {
    return " ".repeat(padding) + text;
  } else if (align === "center") {
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return " ".repeat(leftPad) + text + " ".repeat(rightPad);
  } else {
    return text + " ".repeat(padding);
  }
}

export default async function list(options) {
  try {
    const response = await api.getNotes();
    let notes = Array.isArray(response) ? response : [];

    // if length is specified, limit the number of notes
    if (options.length) {
      const limit = parseInt(options.length, 10);
      if (isNaN(limit) || limit < 1) {
        console.error(chalk.red("Error: Length must be a positive number"));
        process.exit(1);
      }
      notes = notes.slice(0, limit);
    }

    if (notes.length === 0) {
      console.log(chalk.yellow("No notes found"));
      return;
    }

    // show the total number of notes and the number of notes displayed
    const totalNotes = Array.isArray(response) ? response.length : 0;
    if (options.length) {
      console.log(chalk.cyan(`Showing ${notes.length} of ${totalNotes} notes`));
    }

    if (options.verbose) {
      // 在详细模式下获取每个笔记的完整内容
      for (const note of notes) {
        try {
          // 获取完整的笔记内容
          const fullNote = await api.getNote(note.id);
          console.log(chalk.cyan("\nNote Details:"));

          // 检查是否有任何选项被指定
          const hasSpecificOptions =
            options.title ||
            options.content ||
            options.author ||
            options.created ||
            options.modified ||
            options.id ||
            options.read ||
            options.write;

          // 如果没有指定任何选项，显示默认字段
          if (!hasSpecificOptions) {
            console.log(chalk.white("Title:"), fullNote.title || "");
            console.log(chalk.white("ID:"), fullNote.id || "");
            console.log(
              chalk.white("Created:"),
              new Date(fullNote.createdAt || Date.now()).toLocaleString()
            );
            console.log(
              chalk.white("Modified:"),
              new Date(fullNote.lastChangedAt || Date.now()).toLocaleString()
            );
          } else {
            // 否则显示指定的字段
            if (options.title) {
              console.log(chalk.white("Title:"), fullNote.title || "");
            }
            if (options.content) {
              console.log(chalk.white("\nContent:"));
              console.log(chalk.gray(fullNote.content || ""));
            }
            if (options.author) {
              console.log(chalk.white("Author:"), fullNote.userPath || "");
            }
            if (options.created) {
              console.log(
                chalk.white("Created:"),
                new Date(fullNote.createdAt || Date.now()).toLocaleString()
              );
            }
            if (options.modified) {
              console.log(
                chalk.white("Modified:"),
                new Date(fullNote.lastChangedAt || Date.now()).toLocaleString()
              );
            }
            if (options.id) {
              console.log(chalk.white("ID:"), fullNote.id || "");
            }
            if (options.read) {
              console.log(
                chalk.white("Read Permission:"),
                fullNote.readPermission || ""
              );
            }
            if (options.write) {
              console.log(
                chalk.white("Write Permission:"),
                fullNote.writePermission || ""
              );
            }
          }
          console.log(chalk.gray("─".repeat(50)));
        } catch (error) {
          console.log(
            chalk.red(
              `Failed to fetch details for note ${note.id}: ${error.message}`
            )
          );
        }
      }
    } else {
      // 检查是否有任何选项被指定
      const hasSpecificOptions =
        options.title ||
        options.content ||
        options.author ||
        options.created ||
        options.modified ||
        options.id ||
        options.read ||
        options.write;

      // 设置要显示的字段
      const selectedFields = [];
      if (hasSpecificOptions) {
        // 如果指定了选项，只显示指定的字段
        if (options.title) selectedFields.push("title");
        if (options.content) selectedFields.push("content");
        if (options.author) selectedFields.push("author");
        if (options.created) selectedFields.push("created");
        if (options.modified) selectedFields.push("modified");
        if (options.id) selectedFields.push("id");
        if (options.read) selectedFields.push("read");
        if (options.write) selectedFields.push("write");
      } else {
        // 如果没有指定选项，显示默认字段
        selectedFields.push("title", "id", "created", "modified");
      }

      const widths = getColumnWidths(notes, selectedFields);

      // 打印表头
      const headers = [];
      if (selectedFields.includes("title"))
        headers.push(padText(chalk.cyan("Title"), widths.title));
      if (selectedFields.includes("content"))
        headers.push(padText(chalk.cyan("Content"), widths.content));
      if (selectedFields.includes("author"))
        headers.push(padText(chalk.cyan("Author"), widths.author));
      if (selectedFields.includes("created"))
        headers.push(padText(chalk.cyan("Created"), widths.created));
      if (selectedFields.includes("modified"))
        headers.push(padText(chalk.cyan("Modified"), widths.modified));
      if (selectedFields.includes("id"))
        headers.push(padText(chalk.cyan("ID"), widths.id));
      if (selectedFields.includes("read"))
        headers.push(padText(chalk.cyan("Read"), widths.read));
      if (selectedFields.includes("write"))
        headers.push(padText(chalk.cyan("Write"), widths.write));

      console.log(headers.join(" │ "));

      // 打印分隔线
      const separators = selectedFields.map((field) =>
        "─".repeat(widths[field])
      );
      console.log(separators.join("─┼─"));

      // 打印数据行
      notes.forEach((note) => {
        const fields = [];
        if (selectedFields.includes("title")) {
          fields.push(
            padText(chalk.white(truncateText(note.title || "")), widths.title)
          );
        }
        if (selectedFields.includes("content")) {
          fields.push(
            padText(
              chalk.white(truncateText(note.content || "", 100)),
              widths.content
            )
          );
        }
        if (selectedFields.includes("author")) {
          fields.push(padText(chalk.blue(note.userPath || ""), widths.author));
        }
        if (selectedFields.includes("created")) {
          fields.push(
            padText(
              chalk.yellow(
                new Date(note.createdAt || Date.now()).toLocaleString()
              ),
              widths.created
            )
          );
        }
        if (selectedFields.includes("modified")) {
          fields.push(
            padText(
              chalk.green(
                new Date(note.lastChangedAt || Date.now()).toLocaleString()
              ),
              widths.modified
            )
          );
        }
        if (selectedFields.includes("id")) {
          fields.push(padText(chalk.gray(note.id || ""), widths.id));
        }
        if (selectedFields.includes("read")) {
          fields.push(
            padText(
              chalk.magenta(`Read: ${note.readPermission || ""}`),
              widths.read
            )
          );
        }
        if (selectedFields.includes("write")) {
          fields.push(
            padText(
              chalk.cyan(`Write: ${note.writePermission || ""}`),
              widths.write
            )
          );
        }

        console.log(fields.join(" │ "));
      });
    }
  } catch (error) {
    console.error(chalk.red("Error listing notes:"), error.message);
    if (error.response) {
      console.error(chalk.gray("API Response:"), error.response.data);
    }
    process.exit(1);
  }
}
