#! /usr/bin/env node

import { Command } from "commander";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8")
);

import login from "./commands/login.js";
import list from "./commands/list.js";
import create from "./commands/create.js";
import edit from "./commands/edit.js";
import deleteNote from "./commands/delete.js";
import exportNote from "./commands/export.js";
import fetchNote from "./commands/fetch.js";
import sync from "./commands/sync.js";
import remote from "./commands/remote.js";

const program = new Command();

program.version(packageJson.version).description("HackMD CLI Tool");

// Login command
program
  .command("login")
  .description("Login to HackMD")
  .option("-u, --username <username>", "Username")
  .option("-p, --password <password>", "Password")
  .action(login);

// Remote management
program
  .command("remote <action> [name] [url]")
  .description("Manage remote sources")
  .action(remote);

// List cached notes
program
  .command("list")
  .description("List cached notes (run 'fetch --all' first if empty)")
  .action(list);

// Fetch notes
program
  .command("fetch [note-id]")
  .description("Fetch notes from HackMD")
  .option("-a, --all", "Fetch all notes")
  .option("-r, --remote <remote>", "Remote source to fetch from", "origin")
  .action(fetchNote);

// Sync notes
program
  .command("sync")
  .description("Check for changes between local and remote notes")
  .option("-p, --pull", "Pull remote changes to local cache")
  .option("-r, --remote <remote>", "Remote to sync with", "origin")
  .action(sync);

// Create note
program
  .command("new")
  .description("Create new note")
  .option("-t, --title <title>", "Note title")
  .option("-C, --content <content>", "Note content")
  .option("-r, --readPermission <readPermission>", "Read permission")
  .option("-w, --writePermission <writePermission>", "Write permission")
  .option("-c, --commentPermission <commentPermission>", "Comment permission")
  .action(create);

// Edit note
program.command("edit [note-id]").description("Edit note").action(edit);

// Delete note
program
  .command("delete [note-id]")
  .description("Delete note")
  .action(deleteNote);

// Export note
program
  .command("export [note-id]")
  .description("Export note")
  .option("-f, --format <format>", "Export format (md/html/pdf)", "md")
  .option("-o, --output <path>", "Output path")
  .action(exportNote);

program.parse(process.argv);
