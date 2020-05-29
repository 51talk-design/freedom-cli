const inquirer = require('inquirer');

/**
 * prompt处理
 * @class
 */
class Inquirer {
  /**
   * 构造器，初始化inquirer prompt相关配置
   * @param {object} opts inquirer配置项
   */
  constructor(opts) {
    opts = opts || {};
    opts.type = opts.type || "list";
    opts.name = opts.name || "selected";
    opts.pageSize = opts.pageSize > 0 ? opts.pageSize : 50;
    opts.message = opts.message || "";
    opts.choices = opts.choices || opts.items;

    this.opts = opts;
  }

  /**
   * 显示prompt列表
   * @return {object} 返回prompt列表对象
   */
  async promtList() {
    let answer = await inquirer.prompt([this.opts]);
    return answer;
  }
}

module.exports = Inquirer;