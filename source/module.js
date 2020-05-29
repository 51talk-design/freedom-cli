const colors = require("colors");
const shell = require("freedom-util-shell")();

const BasicConf = require("./basicConf");
const switchRegistryInstance = require("./switchRegistry");

/**
 * global package模块安装
 * @class
 */
class Module extends BasicConf {
  /**
   * 构造器，初始化相关信息
   */
  constructor() {
    super();
    this.moduleInstallPrefix = "";
  }

  /**
   * cnpm指定的package安装目录
   * @returns {string} 返回cnpm安装的package目录
   */
  async getPrefix() {
    if (this.moduleInstallPrefix) return this.moduleInstallPrefix;
    this.moduleInstallPrefix = await shell.execCmd(`${this.command.command} config get prefix`, false);
    return this.moduleInstallPrefix;
  }

  /**
   * 卸载已经安装模块
   * @param {string} modName 模块名称
   * @param {string} flag 安装标识，比如：-g,--save-dev 等等
   * @returns {boolean} 安装成功返回true
   */
  async unInstallMod(modName, flag = "") {
    await switchRegistryInstance.switchRegistry();
    console.log((`unInstalling package 【${modName}】...`).bold.cyan);
    console.log((`please waiting...`).bold.cyan);
    try {
      await shell.execCmd(`cnpm uninstall ${modName} ${flag}`);
      console.log((`unInstall package 【${modName}】complete...`).bold.cyan);
      return true;
    } catch (err) {
      console.log((`unInstall package 【${modName}】fail...`).bold.red);
      console.log(err);
      process.exit(1);
    }
  }

  /**
   * 安装模块
   * @param {string} modName 模块名称
   * @param {string} flag 安装标识，比如：-g,--save-dev 等等
   * @returns {boolean} 安装成功返回true
   */
  async installMod(modName, flag = "") {
    await switchRegistryInstance.switchRegistry();
    console.log((`installing package 【${modName}】...`).bold.cyan);
    console.log((`please waiting...`).bold.cyan);
    try {
      await shell.execCmd(`${this.command.command} install ${modName} ${flag}`, true);
      console.log((`install package 【${modName}】complete...`).bold.cyan);
      return true;
    } catch (err) {
      console.log((`install package 【${modName}】fail...`).bold.red);
      console.log(err);
      process.exit(1);
    }
  }
}
module.exports = Module;
