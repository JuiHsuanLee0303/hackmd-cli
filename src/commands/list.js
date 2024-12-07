import chalk from "chalk";
import noteCache from "../utils/cache.js";

async function list() {
  try {
    const notes = await noteCache.getNotes();

    if (notes.length === 0) {
      console.log(chalk.yellow("\nNo cached notes found."));
      console.log(
        chalk.cyan(
          'Please run "hackmd fetch --all" first to fetch and cache notes.'
        )
      );
      process.exit(1);
    }

    console.log(chalk.green("\nCached Notes:"));
    notes.forEach((note, index) => {
      console.log(chalk.cyan(`\n${index + 1}. ${note.title}`));
      console.log(chalk.gray(`   ID: ${note.id}`));
      console.log(
        chalk.gray(
          `   Last Updated: ${new Date(note.lastChangeAt).toLocaleString()}`
        )
      );
    });
  } catch (error) {
    console.error(chalk.red("Error: " + error.message));
    process.exit(1);
  }
}

export default list;
