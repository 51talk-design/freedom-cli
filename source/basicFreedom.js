const BasicConf = require("./BasicConf");
const colors = require("colors");
const fs = require("fs");

let _privateGitToken = "";

class BasicFreedom extends BasicConf {
  constructor(opts) {
    super();
    // gitlab 默认为公司环境，需要检测登录
    if (this.command.repository == "gitlab") this._checkLogin();
    // 检查工具必须文件
    this._checkRemoteConf();
  }

  /**
   * 检查远程配置文件是否已经download
   * - middleware.yml、template.yml、freedom.yml
   * @return {void} 无返回值 
   */
  _checkRemoteConf() {
    let isNeedCheck = true;
    let confPath = this.localConfigDir;
    //如果本地没有config目录，以及config目录下没有东西的话，则不需要检查
    if (!fs.existsSync(confPath)) {
      isNeedCheck = false;
    } else {
      let files = fs.readdirSync(confPath);
      if (files.length <= 0) isNeedCheck = false;
    }
    if (!isNeedCheck) return;
    // 统一为一种更新方式，如缺少配置，一次性更新
    if (!fs.existsSync(this.templateYmlPath)) {
      console.log((`check you do not download freedom project template...`).bold.cyan);
      console.log((`please usage commond 【fm update -l】to update!`).bold.cyan);
      process.exit(1);
    }
    if (!fs.existsSync(this.middlewareYmlPath)) {
      console.log((`check you do not download freedom middlewares...`).bold.cyan);
      console.log((`please usage commond 【fm update -l】to update!`).bold.cyan);
      process.exit(1);
    }
    if (!fs.existsSync(this.freedomYmlPath)) {
      console.log((`check you do not have develop flow configure...`).bold.cyan);
      console.log((`please usage commond 【fm update -l】to update!`).bold.cyan);
      process.exit(1);
    }
  }

  /**
   * 检查用户是否登录
   * @return {void} 无返回值
   */
  _checkLogin() {
    if (!this.privateGitToken && !fs.existsSync(this.targetGitConfDirPath)) {
      console.log((`check you do not sign in gitlab...`).bold.cyan);
      console.log((`please usage commond 【fm login】to sign in!`).bold.cyan);
      process.exit(1);
    }
    if (!this.privateGitToken) _privateGitToken = fs.readFileSync(this.targetGitConfDirPath, "utf-8");
    if (!this.privateGitToken) {
      console.log((`check you do not sign in gitlab...`).bold.cyan);
      console.log((`please usage commond 【fm login】to sign in!`).bold.cyan);
      process.exit(1);
    }
  }

  get privateGitToken() {
    return _privateGitToken;
  }
}

module.exports = BasicFreedom;