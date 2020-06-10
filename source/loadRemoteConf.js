const RemoteConf = require("./remoteConfig");
const BasicConfig = require("./basicConf");

const remoteConf = new RemoteConf();

class LoadRemoteConf extends BasicConfig {
  constructor() {
    super();
  }

  /**
   * 加载配置
   * @return {void} 无返回值
   */
  async downloadConfigs() {
    if (!this.cache.config) await remoteConf.loadRemoteConf();
    return;
  }
}

module.exports = new LoadRemoteConf();