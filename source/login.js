const fs = require("fs");
const inquirer = require('inquirer');
const chalk = require("chalk");
const FormData = require('form-data');
const fetch = require("../common/fetch");
const colors = require("colors");

const BasicConf = require("./basicConf");

//配置提示question
const QUESTIONS = [{
  type: "input",
  name: "email",
  message: ("please enter your account").bold.green
}, {
  type: "password",
  name: "password",
  message: ("please enter your password：").bold.green
}];

/**
 * gitlab登录
 * @class
 * @extends {BasicConf}
 */
class Login extends BasicConf {
  /**
   * 构造器，初始化相关信息
   */
  constructor() {
    super();
  }

  /**
   * 登录gitlab账号
   * @return {void} 无返回值
   */
  async login() {
    if (!fs.existsSync(this.targetGitConfDirPath) || !fs.readFileSync(this.targetGitConfDirPath, "utf-8")) {
      let answer = await inquirer.prompt(QUESTIONS);
      let form = new FormData();
      form.append('email', answer.email);
      form.append('password', answer.password);
      console.log((`sign in,please waiting...`).bold.cyan);
      let result = await fetch.requestRemoteServer(this.gitApiConf["session"], {
        method: "Post",
        body: form
      });
      if (!result.private_token) {
        console.log((`登录失败，请检查用户名和密码!`).bold.green);
        return;
      }
      //登录成功写入token到本地
      fs.writeFileSync(this.targetGitConfDirPath, result.private_token);
      console.log((`sign in success!`).bold.green);
      process.exit(1);
    } else {
      console.log((`you have signed in!`).bold.green);
      process.exit(1);
    }
  }
}

module.exports = Login;
