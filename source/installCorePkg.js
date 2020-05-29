const BasicConfig = require("./basicConf");
const yaml = require("js-yaml");
const shell = require("freedom-util-shell")();
const colors = require("colors");
const fs = require("fs");
const cache = require("./cache");

let corePkgYmlContent = null;
class InstallCorePkg extends BasicConfig {
  constructor() {
    super();
    if (!fs.existsSync(this.corePkgYmlPath)) {
      console.log((`freedom-corepkg.yml can not exist\r\nplease execute 【fm update】to update remote config`).bold.cyan);
      process.exit(1);
    }
    try {
      if (!corePkgYmlContent) corePkgYmlContent = yaml.safeLoad(fs.readFileSync(this.corePkgYmlPath, 'utf8'));
      this.corePkgYmlContent = corePkgYmlContent;
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
  async installCorePkg() {
    // 默认先安装执行指定的配置包
    // 配置到远程gitlab仓库获取
    let needInstallPkgs = this.corePkgYmlContent;
    // 先执行项目特殊依赖
    console.log((`installing core package dependency`).bold.cyan);
    console.log((`please waiting ......`).bold.cyan);
    try {
      for (let pkg of needInstallPkgs) {
        await shell.execCmd(`${this.command.command} install ${pkg.name}@${pkg.version}`, true, {
          cwd: process.cwd()
        });
        console.log((`install core package 【${pkg.name}】complete`).bold.cyan);
      }
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
    if (needInstallPkgs && needInstallPkgs.length > 0) cache.setCache("corePkg", true);
  }
}

module.exports = InstallCorePkg;