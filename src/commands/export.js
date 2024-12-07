import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs/promises";
import path from "path";
import api from "../utils/api.js";
import config from "../config/index.js";

async function exportNote(noteId, options) {
  try {
    // 检查登录状态
    const token = config.get("token");
    if (!token) {
      console.error(chalk.red("请先登录！"));
      process.exit(1);
    }

    const { format = "md", output } = options;

    // 获取笔记信息
    const spinner = ora("获取笔记信息...").start();
    let note;

    try {
      note = await api.get(`/notes/${noteId}`);
      spinner.succeed(chalk.green("获取笔记信息成功！"));
    } catch (error) {
      spinner.fail(chalk.red("获取笔记失败：" + error.message));
      process.exit(1);
    }

    // 确定输出路径
    let outputPath = output;
    if (!outputPath) {
      const defaultFilename = `${note.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.${format}`;
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "path",
          message: "请输入保存路���:",
          default: defaultFilename,
        },
      ]);
      outputPath = answers.path;
    }

    // 确保输出目录存在
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    spinner.text = "导出笔记中...";
    spinner.start();

    try {
      let content = note.content;

      // 根据格式处理内容
      switch (format.toLowerCase()) {
        case "html":
          content = await api.post(`/notes/${noteId}/html`);
          break;
        case "pdf":
          content = await api.post(`/notes/${noteId}/pdf`);
          break;
        // md 格式不需要转换
      }

      await fs.writeFile(outputPath, content);
      spinner.succeed(chalk.green(`笔记已导出到: ${outputPath}`));
    } catch (error) {
      spinner.fail(chalk.red("导出笔记失败：" + error.message));
    }
  } catch (error) {
    console.error(chalk.red("发生错误：" + error.message));
    process.exit(1);
  }
}

export default exportNote;
