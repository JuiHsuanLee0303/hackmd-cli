#!/usr/bin/env node

import { Command } from "commander";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8")
);

import {
  login,
  config,
  logout,
  list,
  fetch,
  newNote,
  edit,
  deleteNote,
  download,
  init,
  remote,
  pull,
  push,
} from "./commands/index.js";

const program = new Command();

program
  .name("hackmd")
  .version(packageJson.version)
  .description("HackMD CLI Tool");

// Auth commands
program.command("login").description("Login to HackMD").action(login);
program.command("config").description("Show user information").action(config);
program.command("logout").description("Logout from HackMD").action(logout);

// Basic commands
program
  .command("list")
  .description("List notes")
  .option("-v, --verbose", "Show detailed information")
  .option("-t, --title", "Show title")
  .option("-C, --content", "Show content")
  .option("-a, --author", "Show author")
  .option("-d, --created", "Show creation date")
  .option("-m, --modified", "Show last modified date")
  .option("-i, --id", "Show note ID")
  .option("-r, --read", "Show read permission")
  .option("-w, --write", "Show write permission")
  .option("-l, --length <length>", "The number of notes to show")
  .action(list);

program
  .command("fetch [note-id]")
  .description("Fetch notes from HackMD")
  .option("--all", "Fetch all notes")
  .action(fetch);

program
  .command("new")
  .description("Create new note")
  .option("-t, --title <title>", "Note title")
  .option("-C, --content <content>", "Note content")
  .option("-r, --readPermission <permission>", "Read permission")
  .option("-w, --writePermission <permission>", "Write permission")
  .option("-c, --commentPermission <permission>", "Comment permission")
  .option("-f, --file <filename>", "Create from local file")
  .action(newNote);

program
  .command("edit [note-id]")
  .description("Edit note")
  .option("-t, --title <title>", "Note title")
  .option("-C, --content <content>", "Note content")
  .option("-r, --readPermission <permission>", "Read permission")
  .option("-w, --writePermission <permission>", "Write permission")
  .option("-f, --file <filename>", "Edit from local file")
  .action(edit);

program
  .command("delete <note-id>")
  .description("Delete note")
  .action(deleteNote);

program
  .command("download <note-id>")
  .description("Download note")
  .option("-o, --output <path>", "Output path")
  .action(download);

// Remote sync commands
program
  .command("init")
  .description("Initialize a local HackMD repository")
  .action(init);

const remoteCommand = program
  .command("remote")
  .description("Manage remote notes")
  .option("-v, --verbose", "Show detailed information")
  .action((options) => remote.list(options));

remoteCommand
  .command("add <name> <note-id>")
  .description("Add a remote note")
  .action(remote.add);

remoteCommand
  .command("remove <name>")
  .description("Remove a remote note")
  .action(remote.remove);

program
  .command("pull [name]")
  .description("Pull notes from remote")
  .action(pull);

program.command("push [name]").description("Push notes to remote").action(push);

program.parse(process.argv);
