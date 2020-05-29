"use strict";

const fetch = require("node-fetch");

/**
 * fetch远程操作
 * @class
 */
class Fetch {

  /**
   * 构造器，初始化相关信息
   */
  constructor() { }

  /**
   * 请求远程服务
   * @param url 远程服务地址
   * @param options 请求发送的额外参数
   * {
   *    method:"Post",
   *    body:
   *    headers:{
   *      'Content-Type': 'application/json'
   *    }
   * }
   * @return {object} 返回获取的数据
   */
  async requestRemoteServer(url, options) {
    let result = await fetch(url, options);
    return await result.json();
  }
}

module.exports = new Fetch();

