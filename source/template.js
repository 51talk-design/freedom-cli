const Inquirer = require('../common/inquire');
const fsExtra = require('fs-extra');
const path = require("path");
const fs = require("fs");
const colors = require("colors");
const yaml = require("js-yaml");
const repository = require("./repository");
const BasicFreedom = require("./basicFreedom");
const cache = require("./cache");

const FreedomTemplateType = {
  EmptyTemplate: 1,
  CustomTemplate: 2,
  FreedomTemplate: 3
}

let templateContent = null;

/**
 * 项目工程模板相关功能操作
 * @class
 */
class Template extends BasicFreedom {
  /**
   * 构造器，初始化相关信息
   * @param {string} projectName 项目工程名称
   */
  constructor(projectName = "") {
    super();
    this.pname = projectName;
  }

  /**
   * 项目模板是否符合freedom规范
   * @returns {string} 返回string类型的标识结果
   */
  get templateType() {
    let isExistFreedom = fs.existsSync(this.targetFreedomDirPath);
    let isExistPackageJson = fs.existsSync(this.targetPackageJsonDirPath);
    //空模板
    if (!isExistFreedom && !isExistPackageJson) return FreedomTemplateType.EmptyTemplate;
    //普通项目模板
    if (!isExistFreedom && isExistPackageJson) return FreedomTemplateType.CustomTemplate
    return FreedomTemplateType.FreedomTemplate;
  }

  /**
   * 将项目模板转换成符合freedom规范的工程
   * @param {string} type 转换类型，默认为标准的工程项目转换、type=module为block模块工程转换
   * @returns {boolean} 转换成功返回true
   */
  async transferFreedomTpl(type) {
    //本地项目生成“.freedom”目录，拥有“.freedom”目录的工程为符合freedom规范的工程
    console.log((`transfering custom project to freedom project...`).bold.cyan);
    console.log((`please waiting...`).bold.cyan);
    await this.transferCustomTpl();
    console.log((`transfer custom project to freedom project success...`).bold.cyan);
    console.log(" ");
    console.log((`execute 【fm dev】command to run the project...`).bold.green);
    return true;
  }

  /**
   * 转换标准项目工程
   * @return {void} 无返回值
   */
  async transferCustomTpl() {
    await fsExtra.copy(this.freedomYmlPath, this.targetFreedomYmlPath);
    //修改freedom.yml的相关信息
    let pkgFile = this.targetPackageJsonDirPath;
    let freedomFile = this.targetFreedomYmlPath;

    let pkg = fs.readFileSync(pkgFile);
    let freedomString = fs.readFileSync(freedomFile).toString();

    pkg = JSON.parse(pkg);

    freedomString = freedomString.replace(/\${projectName}/gm, pkg.name)
      .replace(/\${version}/gm, pkg.version);
    fs.writeFileSync(freedomFile, freedomString, {
      encoding: "utf-8"
    });
    return;
  }

  /**
   * 生成项目工程模板
   * @param fileName 模板名称
   * @param projectId  gitlab项目id预留参数
   * @returns {Promise.<void>}
   */
  async generateTpl(fileName, projectId = 0) {
    // 判断对应配置文件是否存在，不存在则提示更新
    if (!fs.existsSync(this.freedomYmlPath)) {
      console.log((`The freedom.yml for the template does not exist , please usage commond 【fm update -l】to update!`).bold.red);
      process.exit(1);
    }
    // 初始化项目
    let target = path.normalize(this.pname ? path.join(this.targetDir, `/${this.pname}`) : this.targetDir);
    let source = `${this.localConfDir}/templates/${fileName}`;
    let isCurrent = false; // 是否是当前目录
    if (this.pname === undefined) {
      this.pname = path.basename(this.targetDir); // 如果未指定项目名称，以当前目录为项目名称，在当前目录直接生成项目
      isCurrent = true;
    }
    console.log((`generating project【${this.pname}】...`).bold.cyan);
    console.log((`please waiting...`).bold.cyan);
    await fsExtra.copy(source, target);
    console.log((`generate project【${this.pname}】completed...`).bold.cyan);
    //检测config下editorconfig是否存在(byzj)
    if (!fs.existsSync(`${this.localConfigDir}/.editorconfig`)) {
      console.log((`The .editorconfig for the template does not exist , please usage commond 【fm update -l】to update!`).bold.red);
      process.exit(1);
    }
    //本地是否有editorconfig文件  没有就从config获取(byzj)
    if (!fs.existsSync(`${target}/.editorconfig`)) {
      await fsExtra.copy(`${this.localConfigDir}/.editorconfig`, `${target}/.editorconfig`);
    }
    let freedomFile = `${target}/.freedom/freedom.yml`;
    // 配置文件copy至项目
    await fsExtra.copy(this.freedomYmlPath, freedomFile);
    // 修改package.json的项目名称 和 freedom.yml的相关信息
    let pkgFile = `${target}/package.json`;
    let freedomString = fs.readFileSync(freedomFile).toString();
    let pkg = fs.readFileSync(pkgFile);
    pkg = JSON.parse(pkg);
    pkg.name = this.pname.toLowerCase();
    // freedomString = freedomString.replace(/\${projectName}/gm, projectName).replace(/\${version}/gm, pkg.version).replace(/\${projectId}/gm, projectId);
    freedomString = freedomString.replace(/\${projectName}/gm, pkg.name).replace(/\${version}/gm, pkg.version);
    let pkg_package = pkg;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg_package, null, 2), {
      encoding: "utf-8"
    });
    fs.writeFileSync(freedomFile, freedomString, {
      encoding: "utf-8"
    });
    if (isCurrent) {
      console.log((`execute 【fm dev】command to run the project...`).bold.green);
    } else {
      console.log((`execute 【cd ${this.pname} && fm dev】command to run the project...`).bold.green);
    }
  }

  /**
   * 获取远程yml文件配置信息
   * @param name 配置名称
   * @returns {object} 返回配置信息对象
   */
  async getConf() {
    if (!templateContent)
      templateContent = yaml.safeLoad(fs.readFileSync(this.templateYmlPath, 'utf8'));
    return templateContent;
  }

  /**
   * 列举所有的支持工程模板让用户选择
   * @param {boolean} isOnlyShow 是否只是展示模板，true为是，默认为false
   * @return {string} 返回选择的模板
   */
  async showTemplates(isOnlyShow = false) {
    try {
      let tplConf = await this.getConf();
      let list = [];
      for (let key in tplConf) {
        let item = {};
        item.tplName = key;
        item.name = tplConf[key].tplName;
        item.scope = tplConf[key].scope;
        item.type = tplConf[key].type ? tplConf[key].type : ''; // 模板类型
        item.description = tplConf[key].description;
        list.push(item);
      }
      let choices = list.map((item, index) => {
        let tplNameDesc = `${index + 1}.${item.tplName}`;
        tplNameDesc = tplNameDesc.padEnd(20);
        return {
          name: `${tplNameDesc}${item.description}`,
          value: {
            tplName: (item.scope ? `@${item.scope}/${item.name}` : item.name),
            type: item.type
          }
        }
      });
      let message = (`Press enter to choose template what you need`).bold.green;
      if (isOnlyShow) message = (`find total【${list.length}】templates witch freedom cli support`).bold.green;
      let inquirer = new Inquirer({
        message: message,
        choices: choices
      });
      let answer = await inquirer.promtList();
      return answer.selected;
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}

/**
 * freedom cli工程模板相关操作
 * @param {object} args 中间件参数
 *  - projectName string 初始化项目名称
 * @return {boolean} 成功返回true，否则返回false
 */
module.exports = async function (args) {
  if (!args) return await new Template().showTemplates(true); // 展示模板
  let projectName = args.projectName || "";
  let templateInstance = new Template(projectName);
  // 若是满足freedom cli规范的项目，则直接返回
  if (templateInstance.templateType == FreedomTemplateType.FreedomTemplate) {
    console.log((`this project meets the freedom engineering standard`).bold.cyan);
    console.log((`you can run 【fm dev】command to develop`).bold.cyan);
    return true;
  }
  if (templateInstance.templateType == FreedomTemplateType.CustomTemplate) { // 普通工程则需要转换成freedom cli支持的工程标准
    return await templateInstance.transferFreedomTpl(type);
  }

  // 若是创建新的项目，则选择模板进行项目创建
  let selectedTemplate = await templateInstance.showTemplates(); // 用户选择模板
  let tplName = selectedTemplate.tplName;
  if (!tplName) return false;
  let result = false;
  // 加载选择的模板文件到目录
  try {
    console.log((`downloading project template 【${tplName}】...`).bold.cyan);
    if (!cache.hasTplCache(tplName)) { // 若工程模板之前已经下载，则不需要重新download
      result = await repository.downloadTemplateOrConf(tplName, "templates", tplName);// 检测工程模板是否存在，没有则下载工程模板
      cache.setTplCache(tplName, true);// 工程模板download以后，设置cache记录
    } else result = true;
    if (result) {
      // 复制工程模板到指定的目录
      await templateInstance.generateTpl(tplName);
      return true;
    } else {
      console.log((`download project template 【${tplName}】fail...`).bold.cyan);
      console.log((`please execute 【fm init】command again...`).bold.cyan);
      process.exit(1);
    }
  } catch (error) {
    console.log((`initial project template 【${tplName}】fail...`).bold.cyan);
    console.log(error);
    process.exit(1);
  }
};