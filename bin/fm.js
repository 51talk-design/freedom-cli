#! /usr/bin/env node
const commander = require("commander");
const chalk = require("chalk");
const figlet = require("figlet");
const loadRemoteConf = require("../source/loadRemoteConf");
const templateMiddleware = require("../source/template");
const GlobalConfigInit = require("../source/globalConfigInit");
const Core = require("../source/core");
const Clean = require("../source/clean");
const FreedomFlow = require("../source/freedomFlow");
const Login = require("../source/login");
const updateConf = require("../source/update");

commander.version(require("../package.json").version, '-v, --version');
// commander.option("-g, --global", "freedom cli global setting");
// commander.option("-c, --config", "freedom cli config setting");
commander.usage(chalk.green('<init、dev、test、build、publish、login、clean、update、serve、middleware、mock> [project-name]').bold);

commander.command("config <handle> [value]")
  .description("setting freedom cli dependency config,like registry、github and so on")
  .action(async function (handle, value) {
    GlobalConfigInit.handle(handle, value);
  });

commander.command("show")
  .description("show freedom cli support templates")
  .action(async function (cmd) {
    await loadRemoteConf.downloadConfigs();
    await templateMiddleware();
  });

commander.command("update")
  .description(`update remote config,like template、middleware and others`)
  .option("-mw, --middlewareYmlConf", "update remote middleware.yml config")
  .option("-fm, --freedomYmlConf", "update remote freedom.yml config")
  .option("-t, --templateYmlConf", "update remote template.yml config")
  .option("-p, --packageYmlConf", "update remote freedom-corepkg.yml config")
  .action(async function (cmd) {
    try {
      let optValue = cmd.middlewareYmlConf ? "middlewareYmlConf" : (cmd.freedomYmlConf ? "freedomYmlConf" : "");
      optValue = optValue || (cmd.templateYmlConf ? "templateYmlConf" : "");
      optValue = optValue || (cmd.packageYmlConf ? "packageYmlConf" : "");
      updateConf.update(optValue);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });

commander.command("init")
  .description('create development project and transfer freedom support projects')
  .option("-f, --file", "make file for specify project")
  .option("-p, --pname [project-name]", "initialize the project name")
  .action(async function (cmd) {
    try {
      await loadRemoteConf.downloadConfigs();
      let core = new Core({
        flow: true,
        cmd: cmd,
        middlewares: [{
          args: {
            projectName: cmd.pname
          },
          fn: templateMiddleware
        }]
      });
      core.execute();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });
commander.command("dev")
  .description('deploy project for local development')
  .action(async function (cmd) {
    try {
      await loadRemoteConf.downloadConfigs();
      let freedomFlow = new FreedomFlow({
        flow: true,
        cmd: cmd,
      });
      let freedomFlowMiddlewares = await freedomFlow.execute();
      let core = new Core({
        flow: true,
        cmd: cmd,
        middlewares: freedomFlowMiddlewares
      });
      core.execute();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });
commander.command("test")
  .description('test project unittest')
  .action(async function (cmd) {
    console.log(chalk.green("this command cannot use,please wait to develop"));
  });
commander.command("build")
  .description('compile local project resource')
  .option("-a, --analyzer", "build project with bundle analyzer report ")
  .action(async function (cmd) {
    try {
      await loadRemoteConf.downloadConfigs();
      let freedomFlow = new FreedomFlow({
        flow: true,
        cmd: cmd,
      });
      let freedomFlowMiddlewares = await freedomFlow.execute();
      let core = new Core({
        flow: true,
        cmd: cmd,
        middlewares: freedomFlowMiddlewares,
      });
      core.execute();
    } catch (error) {
      process.exit(1);
    }
  });


commander.command("publish")
  .description('Publish fe resource')
  .option("-p, --prod", "build project with bundle analyzer report ")
  .action(async function (cmd) {
    try {
      await loadRemoteConf.downloadConfigs();
      let freedomFlow = new FreedomFlow({
        flow: true,
        cmd: cmd,
      });
      let freedomFlowMiddlewares = await freedomFlow.execute();
      let core = new Core({
        flow: true,
        cmd: cmd,
        middlewares: freedomFlowMiddlewares
      });
      core.execute();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });

commander.command("login")
  .description("sign in your gitlab account")
  .action(async function (cmd) {
    try {
      await new Login().login();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });
commander.command("clean")
  .description("execute freedom cli clean command")
  .action(async function (cmd) {
    await Clean.cleanFreedom();
  });

commander.command("mock")
  .description(`start mock service`)
  .action(async function (cmd) {
    console.log(chalk.green("this command cannot use,please wait to develop"));
  });

commander.command("middleware")
  .alias("mw")
  .description("freedom cli middlewares handle command")
  .option("-l, --list", "show all freedom cli support middlewares")
  .option("-r, --remove [middleware]", "clean specify freedom cli middleware")
  .action(async function (cmd, value) {
    try {
      await loadRemoteConf.downloadConfigs();
      if (cmd.hasOwnProperty("remove") && cmd.remove
        && typeof cmd.remove === "string") {
        cmd.clean = cmd.remove;
      } else if (cmd.hasOwnProperty("remove")
        && typeof cmd.remove !== "string") {
        cmd.clean = "";
      }
      cmd.cli = commander.global;
      let core = new Core({
        cmd: cmd
      });
      core.execute();
    } catch (error) {
      process.exit(1);
    }
  });

commander.command("serve")
  .description('preview local have compiled project')
  .action(async function (cmd) {
    try {
      await loadRemoteConf.downloadConfigs();
      let freedomFlow = new FreedomFlow({
        flow: true,
        cmd: cmd,
      });
      let freedomFlowMiddlewares = await freedomFlow.execute();
      let core = new Core({
        flow: true,
        cmd: cmd,
        middlewares: freedomFlowMiddlewares
      });
      core.execute();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  });
commander.on("--help", function () {
  console.log();
  console.log(chalk.green("  Examples"));
  console.log();
  console.log(chalk.gray("    # create the development project"));
  console.log(chalk.green("    $ fm init -p freedom-demo"));
  console.log();
  console.log(chalk.green("最新文档请查看：https://github.com/51talk-design/freedom-cli/blob/master/README.md"));
});
commander.parse(process.argv);
if (!commander.args.length) {
  console.log();
  console.log(chalk.green(figlet.textSync('freedom', '3D-ASCII')));
  commander.help();
}
//process.platform
