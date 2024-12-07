import chalk from "chalk";
import ora from "ora";
import api from "../utils/api.js";
import noteCache from "../utils/cache.js";
import remoteManager from "../utils/remotes.js";

async function compareNotes(localNotes, remoteNotes) {
  const changes = {
    new: [], // Notes that exist remotely but not locally
    modified: [], // Notes that exist in both but have different lastChangeAt
    deleted: [], // Notes that exist locally but not remotely
  };

  // Create maps for easier lookup
  const remoteMap = new Map(remoteNotes.map((note) => [note.id, note]));
  const localMap = new Map(localNotes.map((note) => [note.id, note]));

  // Find new and modified notes
  for (const [id, remoteNote] of remoteMap) {
    const localNote = localMap.get(id);
    if (!localNote) {
      changes.new.push(remoteNote);
    } else if (
      new Date(remoteNote.lastChangeAt) > new Date(localNote.lastChangeAt)
    ) {
      changes.modified.push(remoteNote);
    }
  }

  // Find deleted notes
  for (const [id, localNote] of localMap) {
    if (!remoteMap.has(id)) {
      changes.deleted.push(localNote);
    }
  }

  return changes;
}

async function sync(options) {
  const { remote: remoteName = "origin" } = options;
  let spinner = ora(`Checking remote '${remoteName}'...`).start();

  try {
    // Verify remote exists
    await remoteManager.getRemote(remoteName);
    spinner.succeed(chalk.green(`Remote '${remoteName}' found`));

    // Get local notes
    spinner = ora("Loading local cache...").start();
    const localNotes = await noteCache.getNotes();
    spinner.succeed(chalk.green("Local cache loaded"));

    // Fetch remote notes
    spinner = ora(`Fetching notes from '${remoteName}'...`).start();
    const remoteNotes = await api.get("/notes", {}, remoteName);
    spinner.succeed(chalk.green("Remote notes fetched"));

    // Compare notes
    spinner = ora("Comparing notes...").start();
    const changes = await compareNotes(localNotes, remoteNotes);
    spinner.stop();

    // Display changes
    if (
      changes.new.length === 0 &&
      changes.modified.length === 0 &&
      changes.deleted.length === 0
    ) {
      console.log(
        chalk.green(`\nEverything is up to date with '${remoteName}'!`)
      );
      return;
    }

    console.log(chalk.cyan(`\nChanges detected in '${remoteName}':`));

    // Show new notes
    if (changes.new.length > 0) {
      console.log(chalk.green("\nNew notes:"));
      changes.new.forEach((note) => {
        console.log(chalk.gray(`+ ${note.title} (${note.id})`));
      });
    }

    // Show modified notes
    if (changes.modified.length > 0) {
      console.log(chalk.yellow("\nModified notes:"));
      changes.modified.forEach((note) => {
        console.log(chalk.gray(`* ${note.title} (${note.id})`));
      });
    }

    // Show deleted notes
    if (changes.deleted.length > 0) {
      console.log(chalk.red("\nDeleted notes:"));
      changes.deleted.forEach((note) => {
        console.log(chalk.gray(`- ${note.title} (${note.id})`));
      });
    }

    // If --pull option is specified, update local cache
    if (options.pull) {
      spinner = ora("Updating local cache...").start();
      await noteCache.saveNotes(remoteNotes);
      spinner.succeed(chalk.green("Local cache updated successfully!"));
    } else {
      console.log(
        chalk.cyan(
          `\nRun 'hackmd sync -p -r ${remoteName}' to update local cache`
        )
      );
    }
  } catch (error) {
    if (spinner) {
      spinner.fail(chalk.red("Error: " + error.message));
    } else {
      console.error(chalk.red("Error: " + error.message));
    }
    process.exit(1);
  }
}

export default sync;
