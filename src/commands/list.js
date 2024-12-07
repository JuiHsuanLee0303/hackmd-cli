import chalk from "chalk";
import stringWidth from "string-width";
import api from "../utils/api.js";

// 截断文本的辅助函数
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

// 移除 ANSI 颜色代码以计算实际长度
function stripAnsi(str) {
  if (!str) return "";
  return str.replace(/\x1B\[\d+m/g, "");
}

// 获取表格列宽
function getColumnWidths(notes, selectedFields) {
  const widths = {
    title: Math.max(4, stringWidth("Title")), // "Title" 的长度
    content: Math.max(7, stringWidth("Content")), // "Content" 的长度
    author: Math.max(6, stringWidth("Author")), // "Author" 的长度
    created: Math.max(7, stringWidth("Created")), // "Created" 的长度
    modified: Math.max(8, stringWidth("Modified")), // "Modified" 的长度
    id: Math.max(2, stringWidth("ID")), // "ID" 的���度
    read: Math.max(4, stringWidth("Read")), // "Read" 的长度
    write: Math.max(5, stringWidth("Write")), // "Write" 的长度
    comment: Math.max(7, stringWidth("Comment")), // "Comment" 的长度
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
    if (selectedFields.includes("comment")) {
      widths.comment = Math.max(
        widths.comment,
        stringWidth(`Comment: ${note.commentPermission || ""}`)
      );
    }
  });

  return widths;
}

// 填充空格使文本对齐
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
    const notes = Array.isArray(response) ? response : [];

    if (notes.length === 0) {
      console.log(chalk.yellow("No notes found"));
      return;
    }

    if (options.verbose) {
      notes.forEach((note) => {
        console.log(chalk.cyan("\nNote Details:"));
        if (options.title || !Object.keys(options).length) {
          console.log(chalk.white("Title:"), truncateText(note.title || ""));
        }
        if (options.content) {
          console.log(
            chalk.white("Content:"),
            truncateText(note.content || "", 100)
          );
        }
        if (options.author) {
          console.log(chalk.white("Author:"), note.userPath || "");
        }
        if (options.created) {
          console.log(
            chalk.white("Created:"),
            new Date(note.createdAt || Date.now()).toLocaleString()
          );
        }
        if (options.modified) {
          console.log(
            chalk.white("Modified:"),
            new Date(note.lastChangedAt || Date.now()).toLocaleString()
          );
        }
        if (options.id) {
          console.log(chalk.white("ID:"), note.id || "");
        }
        if (options.read) {
          console.log(
            chalk.white("Read Permission:"),
            note.readPermission || ""
          );
        }
        if (options.write) {
          console.log(
            chalk.white("Write Permission:"),
            note.writePermission || ""
          );
        }
        if (options.comment) {
          console.log(
            chalk.white("Comment Permission:"),
            note.commentPermission || ""
          );
        }
        console.log(chalk.gray("---"));
      });
    } else {
      const selectedFields = [];
      if (options.title || !Object.keys(options).length)
        selectedFields.push("title");
      if (options.content) selectedFields.push("content");
      if (options.author) selectedFields.push("author");
      if (options.created) selectedFields.push("created");
      if (options.modified) selectedFields.push("modified");
      if (options.id) selectedFields.push("id");
      if (options.read) selectedFields.push("read");
      if (options.write) selectedFields.push("write");
      if (options.comment) selectedFields.push("comment");

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
      if (selectedFields.includes("comment"))
        headers.push(padText(chalk.cyan("Comment"), widths.comment));

      console.log(headers.join(" │ "));

      // 打印分隔线
      const separators = selectedFields.map((field) =>
        "─".repeat(widths[field])
      );
      console.log(separators.join("─┼─"));

      // ���印数据行
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
        if (selectedFields.includes("comment")) {
          fields.push(
            padText(
              chalk.red(`Comment: ${note.commentPermission || ""}`),
              widths.comment
            )
          );
        }

        console.log(fields.join(" │ "));
      });
    }
  } catch (error) {
    console.error(chalk.red("Error listing notes:"), error.message);
    // 添加调试信息
    if (error.response) {
      console.error(chalk.gray("API Response:"), error.response.data);
    }
    process.exit(1);
  }
}
