import fs from "fs/promises";
import path from "path";
import config from "../config/index.js";

class RemoteManager {
  constructor() {
    this.remotesPath = path.join(
      path.dirname(config.get("tokenPath")),
      "remotes.json"
    );
  }

  async initializeIfNeeded() {
    try {
      await fs.access(this.remotesPath);
    } catch {
      await this.saveRemotes({});
    }
  }

  async getRemotes() {
    try {
      await this.initializeIfNeeded();
      const data = await fs.readFile(this.remotesPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async saveRemotes(remotes) {
    await fs.writeFile(this.remotesPath, JSON.stringify(remotes, null, 2));
  }

  async addRemote(name, url) {
    const remotes = await this.getRemotes();
    remotes[name] = { url, addedAt: new Date().toISOString() };
    await this.saveRemotes(remotes);
  }

  async removeRemote(name) {
    const remotes = await this.getRemotes();
    if (!remotes[name]) {
      throw new Error(`Remote '${name}' does not exist`);
    }
    delete remotes[name];
    await this.saveRemotes(remotes);
  }

  async getRemote(name) {
    const remotes = await this.getRemotes();
    const remote = remotes[name];
    if (!remote) {
      throw new Error(`Remote '${name}' does not exist`);
    }
    return remote;
  }
}

export default new RemoteManager();
