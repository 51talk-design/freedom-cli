const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const os = require("os");
//本地配置文件目录
const LOCAL_CONF_DIR = path.join(os.homedir(), "/.freedom");
if (!fs.existsSync(LOCAL_CONF_DIR)) mkdirp.sync(LOCAL_CONF_DIR);

//本地配置目录
module.exports.localConfDir = LOCAL_CONF_DIR;
