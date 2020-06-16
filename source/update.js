const BasicConf = require("./basicConf");
const fsExtra = require('fs-extra');
const repository = require("./repository");
const colors = require("colors");

class UpdateConf extends BasicConf {
  constructor() {
    super();
    this.configFilePath = {
      middlewareYmlConf: this.middlewareYmlPath,
      freedomYmlConf: this.freedomYmlPath,
      templateYmlConf: this.templateYmlPath,
      packageYmlConf: this.corePkgYmlPath
    };
    this.configFile = {
      middlewareYmlConf: "middleware.yml",
      freedomYmlConf: "freedom.yml",
      templateYmlConf: "template.yml",
      packageYmlConf: "freedom-corepkg.yml"
    };
  }
  async update(optValue) {
    console.log((`loading remote config file 【${this.configFile[optValue]}】...`).bold.cyan);
    console.log((`please waiting...`).bold.cyan);
    await fsExtra.remove(this.configFilePath[optValue]);
    await repository.updateCofigFile(this.command.project, `config/${this.configFile[optValue]}`);
    console.log((`load remote config file 【${this.configFile[optValue]}】completed`).bold.cyan);
  }
}

module.exports = new UpdateConf();