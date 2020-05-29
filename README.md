# 文档

- [freedom-cli简介](#freedom-cli简介)
- [特点](#特点)
- [使用说明](使用说明)
- [freedom cli配套模板](#freedom-cli配套模板)
- [freedom cli配套中间件](#freedom-cli配套中间件)
- [上线日志](上线日志)

## freedom-cli简介

freedom-cli是前端开发人员用于构建以及工程化的一个脚手架工具。

它通过流程配置的方式，把前端开发的整个流程分解为一个一个单一功能组件，然后通过配置赋予开发人员自己想要的构建流程，简化并统一了开发人员日常构建与开发相关的工作，同时每个常用功能组件(middleware)可单独维护，单独使用。

![工具预览](//cdn.51talk.com/apollo/images/db894e071ce69815d4ca2976930de498.jpg)

## 特质
- 扩展性强，配置灵活
- 将常用的功能组件，比如：webpack构建、mock、publish等封装成一个个独立的middleware，易于维护与复用。
- 提供统一的几个命令，即可完成从开发、调试、检查、发布等的流程，且可通过配置来自由控制。
- 使用gitlab管理相关配置，以及私服cnpm管理中间件。
- freedom使用可插拔式的设计(**化零为整，化整为零**)，可自由选择中间件，使得团队统一管理前端所有项目，并且又不失灵活性。

## 常用命令
- fm login                      登录,若将整个方案迁移到公司gitlab时使用，具体迁移方案请查阅......
- fm init -p fe-demo    项目初始化
- fm dev                        开发
- fm mock                     启动mock服务
- fm test                        启动eslint语法校验以及测试
- fm serve                     对build后的文件，提供预览服务。
- fm publish                  项目资源发布
- fm clean                      清除freedom cli本地所有的cache记录，若远程配置有变更时，可执行**fm clean**来清除本地cache重新更新
- fm middleware          show工具支持的中间件列表信息
- fm show tpl                show工具支持的工程模板列表信息

## 使用说明

### 安装
`cnpm install -g @51npm/freedom-cli`

### 远程仓储配置信息
freedom-cli 相关配置存储于远程仓储github/gitlab、npm，工具依赖于以下配置信息

| 配置名称   | 配置说明                                                     |
| ---------- | ------------------------------------------------------------ |
| repository | git仓储，默认值为：github，若是公司git仓库，需要设置为gitlab |
| reposGroup | git仓储项目组，工具以来的所有配置项目、工程模板均位于此项目组下<br/>默认值为：https://github.com/51talk-design |
| project    | 工具在git上的配置项目名，默认值为：freedom-cli-config        |
| registry   | npm/cnpm镜像地址，默认值为:https://registry.npm.taobao.org   |
| command    | 工具依赖的包管理工具，默认为cnpm                             |

**若需要更改这几项配置的，可执行以下命令进行修改:**

```
fm config set registry=https://registry.npmjs.org
fm config set repository=gitlab
fm config set reposGroup=https://github.com/51talk-design
fm config set project=freedom-cli-config
fm config set command=npm
```

## 上线日志


