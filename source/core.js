const BasicFreedom = require("./basicFreedom");
const Middleware = require("./middleware");
const shell = require("freedom-util-shell")();
const CmdConf = require("./cmdConf");
const Module = require("./module");
const switchRegistryInstance = require("./switchRegistry");

const middleware = new Middleware();
const moduleInstance = new Module();

class Core extends BasicFreedom {
  /**
   * 构造器，初始化相关信息
   *  - flow 是否为执行流程 true为执行流程，flase为非执行流程
   *  - cmd 工具执行命令
   *  - middlewares 中间件数组
   * @param {object} opts 配置项
   */
  constructor(opts) {
    super(opts);
    // 是否为工程执行流程
    this.flow = opts.flow || false;
    this.cmd = opts.cmd || {};
    this.cmdName = this.cmd._name // 命令名称
    this.middlewares = opts.middlewares || [];
  }

  /**
   * 加载中间件
   * @return {void} 无返回值
   */
  async _downloadMiddlewares() {
    if (!this.cache.middleware) {
      //加载其他的中间件，跟本地的中间件合并
      let remoteMiddlewares = await middleware.downloadMiddlewares();  // 此值结果为[]
      this.middlewares = remoteMiddlewares.concat(this.middlewares);
    }
    return;
  }

  /**
   * 工具执行入口
   * @return {void} 无返回值
   */
  async execute() {
    try {
      // todo:增加工具自动升级功能
      await switchRegistryInstance.switchRegistry();
      // 加载中间件
      await this._downloadMiddlewares();
      if (this.flow) {
        for (let middleware of this.middlewares) {
          let params = middleware.args;
          if (this.cmdName == CmdConf.init) {
            await middleware.fn(params);
            break;
          }
          if (middleware.before && middleware.name) {
            await moduleInstance.installMod(middleware.name);
            let modNamePath = path.normalize(this.targetDir, `/node_modules/${middleware.name}`);
            middleware.fn = require(modNamePath);
          }
          if (middleware.name)
            console.log((`execute middleware 【${middleware.name}】`).bold.cyan);
          let result = await middleware.fn(params);
          if (middleware.script) { // 执行shell
            console.log((`execute script 【${middleware.script}】`).bold.cyan);
            await shell.execCmd(middleware.script, true);
          }
          if (middleware.name && this.cmdName !== CmdConf.publish) // publish命令下需要命令行输入，结束语影响体验，因此去掉
            console.log((`execute middleware 【${middleware.name}】completed`).bold.cyan);
        }
      } else {
        switch (this.cmdName) {
          case CmdConf.middleware:
            await this._executeMiddlewareCmd();
            break;
          case CmdConf.clean:
            await clean.executeFreedomClean({
              cmd: this.cmd
            });
            break;
          case CmdConf.update:
            await update.executeFreedomUpdate({
              cmd: this.cmd
            });
            break;
        }
      }
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }

  async _executeMiddlewareCmd() {
    let options = {
      type: "list",
      name: ""
    };
    if (this.cmd.clean) {
      options.type = "single";
      options.name = this.cmd.clean;
    } else if (this.cmd.clean == "") {
      options.type = "all";
    }
    await middleware.handleMiddleware(options);
  }
}

module.exports = Core;