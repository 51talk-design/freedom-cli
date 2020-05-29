const BasicConf = require("./basicConf");
const fs = require("fs");

class GlobalConfigInit extends BasicConf {
  constructor() {
    super();
  }
  handle(type, value = "") {
    switch (type) {
      case "set":
        if (!value) return;
        const values = value.split("=");
        if (!values || values.length != 2) return;
        const key = values[0];
        const val = values[1];
        this.command[key] = val;
        //登录成功写入token到本地
        fs.writeFileSync(this.coreJsonPath, JSON.stringify(this.command, null, 2));
        break;
      case "get":
        break;
      default:
        break;
    }
  }
}

module.exports = new GlobalConfigInit();