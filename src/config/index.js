import Conf from "conf";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const config = new Conf({
  projectName: "hackmd-cli",
  configName: "config",
  cwd: path.join(os.homedir(), ".hackmd-cli"),
  defaults: {
    apiUrl: "https://api.hackmd.io/v1",
    tokenPath: path.join(os.homedir(), ".hackmd-cli", "token"),
  },
});

export default config;
