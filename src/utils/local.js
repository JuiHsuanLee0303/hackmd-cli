import fs from "fs/promises";
import path from "path";
import os from "os";
import chalk from "chalk";

const CONFIG_DIR = ".hackmd-cli";
const REMOTES_FILE = "remotes.json";
const NOTES_DIR = "notes";

// 處理文件名，移除副檔名和路徑
function normalizeName(name) {
  // 移除副檔名
  const basename = path.basename(name, path.extname(name));
  // 移除路徑分隔符
  return basename.replace(/[\/\\]/g, "_");
}

export async function initRepo() {
  const configPath = path.join(process.cwd(), CONFIG_DIR);
  const notesPath = path.join(configPath, NOTES_DIR);

  try {
    await fs.mkdir(configPath);
    await fs.mkdir(notesPath);
    await fs.writeFile(
      path.join(configPath, REMOTES_FILE),
      JSON.stringify({ remotes: {} }, null, 2)
    );
    return true;
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error("Repository already exists");
    }
    throw error;
  }
}

export async function getRemotes() {
  const configPath = path.join(process.cwd(), CONFIG_DIR, REMOTES_FILE);
  try {
    const data = await fs.readFile(configPath, "utf8");
    return JSON.parse(data).remotes;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Not a hackmd repository (or any of the parent directories)"
      );
    }
    throw error;
  }
}

export async function addRemote(name, noteId) {
  const configPath = path.join(process.cwd(), CONFIG_DIR, REMOTES_FILE);
  const data = await getRemotes();

  // 正規化名稱
  const normalizedName = normalizeName(name);

  if (data[normalizedName]) {
    throw new Error(`Remote '${normalizedName}' already exists`);
  }

  data[normalizedName] = noteId;
  await fs.writeFile(configPath, JSON.stringify({ remotes: data }, null, 2));
  return normalizedName;
}

export async function removeRemote(name) {
  const configPath = path.join(process.cwd(), CONFIG_DIR, REMOTES_FILE);
  const data = await getRemotes();

  // 正規化名稱
  const normalizedName = normalizeName(name);

  if (!data[normalizedName]) {
    throw new Error(`Remote '${normalizedName}' does not exist`);
  }

  delete data[normalizedName];
  await fs.writeFile(configPath, JSON.stringify({ remotes: data }, null, 2));
}

export async function saveNote(name, content) {
  // 正規化名稱
  const normalizedName = normalizeName(name);

  // 在當前目錄保存文件
  const notePath = path.join(process.cwd(), `${normalizedName}.md`);

  try {
    await fs.writeFile(notePath, content);
    console.log(chalk.gray(`Note saved to: ${notePath}`));
    return normalizedName;
  } catch (error) {
    throw new Error(`Failed to save note: ${error.message}`);
  }
}

export async function readNote(name) {
  // 正規化名稱
  const normalizedName = normalizeName(name);

  // 從當前目錄讀取文件
  const notePath = path.join(process.cwd(), `${normalizedName}.md`);

  try {
    return await fs.readFile(notePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Note '${normalizedName}' not found locally`);
    }
    throw error;
  }
}

export default {
  initRepo,
  getRemotes,
  addRemote,
  removeRemote,
  saveNote,
  readNote,
};
