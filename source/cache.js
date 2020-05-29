const BasicConf = require("./basicConf");
const fs = require("fs");

class Cache extends BasicConf {
  constructor() {
    super();
  }
  hasTplCache(tplName) {
    return this.cache["template"][tplName];
  }

  get hasCorePkgCache() {
    return this.cache["corePkg"];
  }

  get hasConfigCache() {
    return this.cache["config"];
  }

  async setTplCache(key, value) {
    let template = this.cache["template"];
    template[key] = value;
    this.cache["template"] = template;
    // 更新本地文件
    fs.writeFileSync(this.cacheJsonPath, JSON.stringify(this.cache, null, 2));
  }

  async setCache(key, value) {
    this.cache[key] = value;
    // 更新本地文件
    fs.writeFileSync(this.cacheJsonPath, JSON.stringify(this.cache, null, 2));
  }
}

module.exports = new Cache();