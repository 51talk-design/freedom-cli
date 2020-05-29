const Module = require("./module");
const Inquirer = require('../common/inquire');
const shell = require("freedom-util-shell")();
const yaml = require("js-yaml");
const colors = require("colors");
const fs = require("fs");
const path = require("path");
const BasicConf = require("./basicConf");
const cache = require("./cache");

const moduleInstance = new Module();

/**
 * 中间件管理
 * @class
 */
class Middleware extends BasicConf {
  /**
   * 构造器，初始化相关信息
   */
  constructor() {
    super();
    this.middlewareConf = null;
    //加载中间件信息
    if (!this.cache.middleware && fs.existsSync(this.middlewareYmlPath)) {
      try {
        this.middlewareConf = yaml.safeLoad(fs.readFileSync(this.middlewareYmlPath, 'utf8'));
      } catch (err) {
        console.log(err);
        process.exit(1);
      }
    }
  }

  /**
   * 中间件加载 @todo 全局中间件、工具的安装处理逻辑木有开发
   * @return {Array<Function>} 返回global的中间列表(即执行流程前要执行的中间件)
   */
  async downloadMiddlewares() {
    if (this.cache.middleware) return;
    // 加载中间件信息，middlewareConf是.freedom/config/middleware.yml内容
    if (!this.middlewareConf && fs.existsSync(this.middlewareYmlPath)) {
      try {
        this.middlewareConf = yaml.safeLoad(fs.readFileSync(this.middlewareYmlPath, 'utf8'));
      } catch (error) {
        console.log(error);
        process.exit(1);
      }
    }
    let prefix = await moduleInstance.getPrefix();
    for (let middleware in this.middlewareConf) {
      let modNamePath = path.normalize(path.join(`${prefix}`, `/node_modules/${this.middlewareConf[middleware]["name"]}`));
      // modNamePath 例如：C:\Program Files\nodejs\node_modules\@nat\freedom-middleware-mock2easy
      // todo:安装全局中间件
    }
    let globalMiddlewares = [];
    if (this.flow) {
      //@todo:require中间件

    }
    return globalMiddlewares;
  }

  /**
   * 卸载全部中间件
   * @return {void} 无返回值
   */
  async unInstallMiddlewares() {
    for (let key in this.middlewareConf) {
      //@todo:需要判断是否为全局cli，全局cli的话需要先uninstall，再执行rm
      await this.unInstallMiddleware(this.middlewareConf[key].name);
    }
  }

  /**
   * 卸载指定的中间件
   * @param {string} modName 要卸载的中间件
   * @param {boolean} cli 是否为全局cli中间件
   * @return {void} 无返回值
   */
  async unInstallMiddleware(modName, cli = false) {
    console.log((`unInstalling middleware 【${modName}】`).bold.cyan);
    console.log((`please waiting ...`).bold.cyan);
    let prefix = await moduleInstance.getPrefix();
    let modNamePath = path.normalize(path.join(`${prefix}`, `/node_modules/${modName}`));
    await shell.execCmd(`chmod -R 777 ${modNamePath}`);
    //todo:判断是否属于全局cli，全局cli先进行uninstall，再remove
    if (cli) {
      await shell.execCmd(`${this.command.command} uninstall ${modName} -g`);
    }
    await shell.execCmd(`rm -rf ${modNamePath}`);
    console.log((`unInstall middleware 【${modName}】complete`).bold.cyan);
  }

  /**
   * 显示所有可用的中间件
   * @return {void} 无返回值
   */
  async showMiddlewares() {
    let list = [];
    for (let key in this.middlewareConf) {
      let item = {};
      item.name = this.middlewareConf[key].name;
      item.description = this.middlewareConf[key].description;
      list.push(item);
    }
    let choices = list.map((item, index) => {
      let tplNameDesc = `${index + 1}.${item.name}`;
      tplNameDesc = tplNameDesc.padEnd(40);
      return {
        name: `${tplNameDesc}${item.description}`,
        value: item.name
      }
    });
    let inquirer = new Inquirer({
      message: (`find total【${list.length}】middlewares`).bold.green,
      choices: choices
    });
    await inquirer.promtList();
  }

  /**
   * 中间件处理，比如：显示中间件、移除中间件等
   * @param {object} opts 
   *  - list 显示中间件
   *  - all 移除所有中间件
   *  - single 移除单个中间件
   * @return {void} 无返回值
   */
  async handleMiddleware(opts) {
    switch (opts.type) {
      case "list":
        await this.showMiddlewares();
        break;
      case "single":
        await this.unInstallMiddleware(opts.name, this.opts.cmd.cli);
        break;
      default://默认全部清除
        await this.unInstallMiddlewares();
        break;
    }
  }
}

module.exports = Middleware;
