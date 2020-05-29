const BasicConf = require("./basicConf");
const download = require('download');
const fs = require("fs");

/**
 * 远程仓库相关操作，比如github、gitlab、cnpm、npm等
 */
class Repository extends BasicConf {
  /**
   * 构造器，初始化相关信息
   */
  constructor() {
    super();
  }

  /**
   * 获取请求模板的ulr
   * @param {string} modType 模块名称
   * @return {string} 返回获取到的模板url
   */
  _getFetchTplUrl(templateName) {
    let url = "";
    switch (this.command.repository) {
      case "github":
        url = `${this.command.reposGroup}/${templateName}/archive/master.zip`;
        break;
      case "gitlab":
        url = `${this.command.reposGroup}/${templateName}/repository/archive.zip?ref=master`;
        break;
      default:
        break;
    }

    return url;
  }

  /**
   * 加载工程模板或者配置到指定目录
   * @param {string} tplName 工程模板名称
   * @param {string} directory 文件夹名称
   * @param {string} catalogue 配置文件存放的目录，默认为空字符
   * @return {boolean} 加载成功返回true，加载失败返回false 
   */
  downloadTemplateOrConf(tplName, directory, catalogue = "") {
    let _this = this;
    // 判断本地工程模板是否存在，不存在则从gitlab download
    let isExist = fs.existsSync(`${this.localConfDir}/${directory}/${tplName}`);
    if (isExist) return true;
    let url = this._getFetchTplUrl(tplName);
    let headers = {
      accept: 'application/zip'
    };
    // 若是gitlab的仓储，则需要将个人账号的私有token带上
    if (this.command.repository == "gitlab") headers["PRIVATE-TOKEN"] = "";
    return new Promise(function (resolve, reject) {
      download(url, `${_this.localConfDir}/${directory}/${catalogue}`, {
        extract: true,
        strip: 1,
        mode: '666',
        headers: headers
      }).then(data => {
        resolve(true);
      }).catch(err => {
        console.log(err)
        reject(false);
      })
    });
  }
}

module.exports = new Repository();