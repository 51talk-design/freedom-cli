const BasicConfig = require("./basicConf");
const fsExtra = require('fs-extra');
const Inquirer = require("../common/inquire");

class Clean extends BasicConfig {
  constructor() {
    super();
  }
  async cleanFreedom() {
    let inquirer = new Inquirer({
      message: ("确定要清除freedom cli本地所有缓存吗？").green,
      choices: ["yes", "no"],
      default: "no"
    });
    let answer = await inquirer.promtList();
    if (answer.selected == "yes") {
      await fsExtra.remove(this.localConfDir);
    }
  }
}

module.exports = new Clean();