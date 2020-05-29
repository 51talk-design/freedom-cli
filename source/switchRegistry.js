const BasicConfig = require("./basicConf");
const shell = require("freedom-util-shell")();

class SwitchRegistry extends BasicConfig {
  constructor() {
    super();
    this.npmRegistry = `${this.command.command} config set registry=${this.command.registry}`;
  }

  async switchRegistry() {
    await shell.execCmd(this.npmRegistry);
  }
}

module.exports = new SwitchRegistry();