const fs = require("fs");
const BasicConf = require("./basicConf");
const colors = require("colors");
const repository = require("./repository");
const cache = require("./cache");

/**
 * 远程配置管理
 * @class
 * @extends {BasicConf}
 */
class RemoteConfig extends BasicConf {
  /**
   * 构造器，初始化相关信息
   */
  constructor() {
    super();
    this._isExistLocalConf = false;
  }

  /**
   * 判断本地配置是否存在
   * @returns {boolean} 存在返回true，不存在返回false
   */
  get isExistLocalConf() {
    if (!this._isExistLocalConf) {
      this._isExistLocalConf = fs.existsSync(this.localConfigDir);
    }
    return this._isExistLocalConf;
  }
  /**
   * 加载远程配置信息
   * @returns {Promise.<void>}
   */
  async loadRemoteConf() {
    try {
      if (this.cache.config) return;
      if (!this.isExistLocalConf) {
        console.log((`loading remote config ...`).bold.cyan);
        console.log((`please waiting...`).bold.cyan);
        await repository.downloadTemplateOrConf(this.command.project, "config");
        console.log((`load remote config completed...`).bold.cyan);
        await cache.setCache("config", true);
      }
    } catch (error) {
      console.log(error);
      console.log((`load remote config happen error...`).bold.red);
      process.exit(1);
    }
  }
}
module.exports = RemoteConfig;
