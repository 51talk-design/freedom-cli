class Utils {
  constructor() { }

  /**
   * 创建新版本号
   * 版本格式为0.0.1，到10位往前递进一位
   * @param {String} name 当前版本号
   * @return {String} 新版本号
   */
  createNewVersion(name) {
    let num = '0.0.1';
    if (name) {
      num = addVersion.apply(null, name.split('.'));
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
}

module.exports = new Utils();