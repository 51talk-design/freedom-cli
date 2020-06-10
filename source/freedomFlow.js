const BasicFreedom = require("./basicFreedom");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const colors = require("colors");
const shell = require("freedom-util-shell")();
const InstallCorePkg = require("./installCorePkg");
const CmdConf = require("./cmdConf");

const installCorePkg = new InstallCorePkg();

/**
 * 前端开发流程
 * @class
 * @extends {BaseFreedom}
 */
class FreedomFlow extends BasicFreedom {
	/**
	 * 构造器，初始化相关信息
	 * @param {object} opts 配置信息
	 */
  constructor(opts) {
    super(opts);
    this.opts = opts || {};
    this.cmd = this.opts.cmd || {};
    if (!fs.existsSync(this.targetFreedomYmlPath)) {
      console.log((`freedom cli cannot support this type project`).bold.cyan);
      console.log((`please execute 【fm init】to transfer project type`).bold.cyan);
      process.exit(1);
    }
    // 流程类型，比如：dev、build、serve等等
    this.flowType = this.cmd._name || "dev";
    this.isPreview = this.cmd.preview;
    this.isTest = this.cmd.test;
    this.isAnalyzer = this.cmd.analyzer;// build命令，是否需要打包分析报告
    this.isProd = this.cmd.prod;// publish命令，是否是上传到生产环境
    try {
      // 加载本地项目流程管控配置文件freedom.yml
      this.flowYmlContent = yaml.safeLoad(fs.readFileSync(this.targetFreedomYmlPath, 'utf8'));
    } catch (error) {
      console.log((`\r\nyour local 【./freedom/freedom.yml】 have not setting correct\r\nplease check if you have setting correct...`).bold.red);
      console.log(error);
      process.exit(1);
    }
  }

	/**
	 * 返回开发流程中要执行的中间件数组
	 * @return {Array<object>} 返回中间件数组
	 */
  async execute() {
    let middlewares = [];
    // 组装开发中间件
    let flows = this.flowYmlContent[this.flowType];  // 读取.yml中的相关配置
    if (this.flowType == CmdConf.build) {
      if (this.isPreview) {
        if (!flows.preview) {
          console.log((`\r\nyour local 【./freedom/freedom.yml】 have not setting correct\r\nplease check if you have setting build preview`).bold.red);
          process.exit(1);
        }
        flows = flows.preview;
      }
      if (this.isTest) {
        if (!flows.test) {
          console.log((`\r\nyour local 【./freedom/freedom.yml】 have not setting correct\r\nplease check if you have setting build test`).bold.red);
          process.exit(1);
        }
        flows = flows.test;
      }
      if (flows.production) flows = flows.production;
    }
    let indexFlag = 0;
    for (let flow of flows) {
      // 空的中间件，只是为了维持中间执行流程的一致性
      let middleware = async function () {
        return true;
      };
      if (indexFlag == 0) {
        indexFlag = 1;
        // freedom.yml配置删除node_modules，则先执行该shell脚本
        if (!flow.name && flow.script.toString().indexOf("rm") > -1 && flow.script.toString().indexOf("node_modules") > -1) {
          console.log((`removing project package dependency node_modules`).bold.cyan);
          await shell.execCmd(`rm -rf node_modules`, true, {
            cwd: this.targetDir
          });
          console.log((`remove project package dependency node_modules completed`).bold.cyan);
          // 安装工程核心包
          await installCorePkg.installCorePkg();
          console.log((`installing project package dependency`).bold.cyan);
          // 安装工程依赖
          await shell.execCmd(`${this.command.command} install`, true, {
            cwd: this.targetDir
          });
          console.log((`install project package dependency completed`).bold.cyan);
          continue;
        } else {
          // 安装工程核心包
          await installCorePkg.installCorePkg();
          console.log((`installing project package dependency`).bold.cyan);
          // 安装工程依赖
          await shell.execCmd(`${this.command.command} install`, true, {
            cwd: this.targetDir
          });
          console.log((`install project package dependency completed`).bold.cyan);
        }
      }
      if (flow.name && !flow.before) { // 有中间件并且不是执行之前安装的话，则进行安装
        let modNamePath = path.normalize(path.join(`${this.targetDir}`, `/node_modules/${flow.name}`));
        if (!fs.existsSync(modNamePath)) { // 不存在，先执行安装
          console.log((`installing package 【${flow.name}】`).bold.cyan);
          console.log((`please waiting ......`).bold.cyan);
          if (!flow.version) {
            await shell.execCmd(`${this.command.command} install ${flow.name}`, true, {
              cwd: this.targetDir
            });
          } else {
            await shell.execCmd(`${this.command.command} install ${flow.name}@latest`, true, {
              cwd: this.targetDir
            });
          }
          console.log((`install package 【${flow.name}】completed`).bold.cyan);
        }
        try {
          middleware = require(modNamePath);
        } catch (e) {
          console.log(`${modNamePath}执行发生错误:`);
          console.log(e);
          process.exit(1);
        }
      }
      // build命令，当使用webpack中间件打包时，处理参数 
      if (this.flowType == CmdConf.build && flow.name && flow.name.indexOf("freedom-middleware-webpack") > -1) flow.args = await this._handleBuildCompileParams(flow);
      // todo:发布功能的处理，往不同环境发布，可移动到中间件处理
      let flowObject = {
        fn: middleware,
        before: flow.before,
        name: flow.name || "",
        script: flow.script || "",
        args: flow.args
      };
      middlewares.push(flowObject);
    }
    return middlewares;
  }

  _createNewVersion(version) {
    let num = '0.0.1';
    if (version) {
      num = addVersion.apply(null, version.split('.'));
    }
    function addVersion(a, b, c) {
      if (++c == 10) {
        c = 0;
        b++;
      }
      if (b == 10) {
        b = 0;
        a++;
      }
      return `${a}.${b}.${c}`;
    }
    return num;
  }

  /**
   * freedom cli配套的构建中间件参数处理
   * @param {object} flow 管控流程flow
   * @return {object} 返回流程flow
   */
  async _handleBuildCompileParams(flow) {
    let params = flow.args;
    try {
      let version = params.specialVersion || "";
      // 生产新的版本号
      // 获取项目package.json上面的version自动生成新的版本
      let pkg = JSON.parse(fs.readFileSync(this.targetPackageJsonDirPath, "utf8"));
      let projectName = pkg.name || "";
      if (!version) {
        version = this._createNewVersion(pkg.version);
        pkg.version = version;
        // 重新更新package.json
        fs.writeFileSync(this.targetPackageJsonDirPath, JSON.stringify(pkg, null, 2));
      }
      console.log((`当前build版本： 【${version}】`).bold.green);
      params.publicPath = path.normalize(`${params.publicPath}/${version}`).replace(/${projectName}/gi, projectName);
      params.build = path.normalize(`${params.build}/${version}`).replace(/${projectName}/gi, projectName);
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
    if (this.isAnalyzer) params.bundleAnalyzerReport = true;
    return params;
  }

	/**
	 * 处理freedom.yml相关信息
	 * @return {void} 无返回值
	 */
  async _handleFreedomYml() {
    //修改this.flowYmlContent对象中的build相关信息
    //修改freedom.yml文件，覆盖本地项目中的freedom.yml
  }
}

module.exports = FreedomFlow;