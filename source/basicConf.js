const path = require("path");
const fs = require("fs");
const conf = require("../config/default");

// 工具版本
const version = require('../package').version;

// 命令执行目录
const TARGET_PATH = process.cwd();
// 本地项目的 .freedom目录
const LOCAL_FREEDOM_DIR = path.normalize(path.join(`${TARGET_PATH}`, `/.freedom`));
// 本地项目package.json路径
const LOCAL_PACKAGE_JSON = path.normalize(path.join(`${TARGET_PATH}`, `/package.json`));
// 本地项目流程配置文件freedom.yml路径
const LOCAL_FREEDOM_YML_PATH = path.normalize(path.join(`${TARGET_PATH}`, `/.freedom/freedom.yml`));

// config配置目录
const LOCAL_CONFIG_PATH = `${conf.localConfDir}/config`;

//gitlab token存储路径
const LOCAL_GITCONF_PATH = `${conf.localConfDir}/git.txt`;
// 执行流程的flow文件存储路径
const LOCAL_FREEDOM_YML = `${conf.localConfDir}/config/freedom.yml`;
// middleware中间件文件存储路径
const LOCAL_MIDDLEWARE_YML = `${conf.localConfDir}/config/middleware.yml`;
// template文件存储路径
const LOCAL_TEMPLATE_YML = `${conf.localConfDir}/config/template.yml`;
// 工程标准核心库
const LOCAL_CORE_PKG_YML = `${conf.localConfDir}/config/freedom-corepkg.yml`;
// 工具执行命令、npm仓储地址、远程配置地址等存储文件
const LOCAL_CORE_JSOM = `${conf.localConfDir}/core.json`;
// 工具本地配置文件、工程核心npm包等cache记录文件
const Local_CACHE_JSON = `${conf.localConfDir}/cache.json`;

let commandRepos = null;
let cache = null;

class BasicConf {
  constructor() {
    this.gitApiConf = conf.gitApiConf;

    // 工具本地存放远程配置的目录
    this.localConfDir = conf.localConfDir;
    // 工具本地存放的config目录
    this.localConfigDir = LOCAL_CONFIG_PATH;

    // 项目工程主要的目录
    this.targetDir = TARGET_PATH;
    this.targetFreedomDirPath = LOCAL_FREEDOM_DIR;
    this.targetPackageJsonDirPath = LOCAL_PACKAGE_JSON;
    this.targetFreedomYmlPath = LOCAL_FREEDOM_YML_PATH;
    this.targetGitConfDirPath = LOCAL_GITCONF_PATH;

    // 工具核心文件的目录
    this.freedomYmlPath = LOCAL_FREEDOM_YML;
    this.middlewareYmlPath = LOCAL_MIDDLEWARE_YML;
    this.templateYmlPath = LOCAL_TEMPLATE_YML;
    this.corePkgYmlPath = LOCAL_CORE_PKG_YML;
    this.coreJsonPath = LOCAL_CORE_JSOM;
    this.cacheJsonPath = Local_CACHE_JSON;

    // 工具执行命令、npm仓储、远程配置仓储等信息
    if (!commandRepos && fs.existsSync(LOCAL_CORE_JSOM)) {
      commandRepos = fs.readFileSync(LOCAL_CORE_JSOM, "utf-8");
    }
    this.command = commandRepos ? JSON.parse(commandRepos) : {
      repository: "github",
      reposGroup: "https://github.com/51talk-design",
      project: "freedom-cli-config",
      registry: "https://registry.npm.taobao.org",
      command: "cnpm"
    };
    if (!fs.existsSync(LOCAL_CORE_JSOM)) fs.writeFileSync(this.coreJsonPath, JSON.stringify(this.command, null, 2));

    if (!cache && fs.existsSync(Local_CACHE_JSON)) {
      cache = fs.readFileSync(Local_CACHE_JSON, "utf-8");
    }
    this.cache = cache ? JSON.parse(cache) : {
      config: false,
      template: {},
      corePkg: false,
      middleware: false
    };

    this.version = version;
  }
}

module.exports = BasicConf;