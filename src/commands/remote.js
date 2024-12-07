import chalk from "chalk";
import remoteManager from "../utils/remotes.js";

async function remote(action, name, url) {
  try {
    switch (action) {
      case "add":
        if (!name || !url) {
          console.error(
            chalk.red(
              "Error: Both name and URL are required for adding a remote"
            )
          );
          console.log(chalk.cyan("\nUsage: hackmd remote add <name> <url>"));
          process.exit(1);
        }
        await remoteManager.addRemote(name, url);
        console.log(chalk.green(`Remote '${name}' added successfully`));
        break;

      case "remove":
        if (!name) {
          console.error(chalk.red("Error: Remote name is required"));
          console.log(chalk.cyan("\nUsage: hackmd remote remove <name>"));
          process.exit(1);
        }
        await remoteManager.removeRemote(name);
        console.log(chalk.green(`Remote '${name}' removed successfully`));
        break;

      case "list":
        const remotes = await remoteManager.getRemotes();
        if (Object.keys(remotes).length === 0) {
          console.log(chalk.yellow("No remotes configured"));
          console.log(chalk.cyan("\nTo add a remote, use:"));
          console.log(chalk.cyan("hackmd remote add <name> <url>"));
          return;
        }

        console.log(chalk.cyan("\nConfigured remotes:"));
        for (const [remoteName, remote] of Object.entries(remotes)) {
          console.log(chalk.white(`\n${remoteName}`));
          console.log(chalk.gray(`  URL: ${remote.url}`));
          console.log(
            chalk.gray(`  Added: ${new Date(remote.addedAt).toLocaleString()}`)
          );
        }
        break;

      default:
        console.error(chalk.red(`Error: Unknown action '${action}'`));
        console.log(chalk.cyan("\nAvailable actions:"));
        console.log(chalk.cyan("  add <name> <url>    Add a new remote"));
        console.log(chalk.cyan("  remove <name>       Remove a remote"));
        console.log(chalk.cyan("  list                List all remotes"));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("Error:", error.message));
    process.exit(1);
  }
}

export default remote;
