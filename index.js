"use strict";

const chalk = require('chalk');
const get = require('lodash/get');
const co = require('co');
const fs = require('fs');
const ROOT_PATH = process.cwd();

let PKG = {};
let SAAS_CONFIG = {};
try {
  // def publish才需要使用package.json、app.config.ts
  // 直接使用require 文件路径不存在时， try catch无法捕获异常， process会中断，所以使用fs.readFileSync替代
  PKG = fs.readFileSync(path.join(ROOT_PATH, 'package.json')).toString();
  SAAS_CONFIG = fs.readFileSync(path.join(ROOT_PATH, 'app.config.ts')).toString();
  PKG = require(path.join(ROOT_PATH, 'package.json'));
  SAAS_CONFIG = require(path.join(ROOT_PATH, 'app.config.ts'));
} catch (err) {}

const { fetchCheckChildApp } = require('./micro/fetch');
const publish = require('./micro/publish');

const ask = (def) => def.ui.list('确定执行线上发布, 执行后不可撤销, 请谨慎操作！！！', [{
  'name': '再检查检查',
  'value': false,
},
{
  'name': '确定线上发布',
  'value': true,
}], false);

const checkChildApp = function* () {
  const name = get(PKG, 'name', '');
  const microAppName = get(SAAS_CONFIG, 'microAppName', '');
  if (!microAppName) {
    throw '缺少microAppName配置, 请在微应用管理平台(https://kbmicro.alibaba-inc.com)获取，并在app.config.ts中进行配置';
  }
  const res = yield fetchCheckChildApp({ name, appRoute: microAppName });
  if (!res.data) {
    throw 'microAppName未注册, 请在微应用管理平台(https://kbmicro.alibaba-inc.com)注册';
  };
}

module.exports = function(def) {

  const Kit = {};

  // def init cake [--options]
  Kit.init = {
    'action': function* (opts) {
      yield def.kit.yo.run({
        generator: '@ali/generator-saas',
        argv:[]
      });
    }
  };

  // def add [type] [names...] [--options]
  Kit.add = {
    'description': '对命令描述，可选，不提供使用默认文案',
    'options': {
    },
    'arguments': {
      'type': {
        'choices': { // 有了 choices 后，用户执行 def add 将会自动展示列表选择
          'c': '添加组件', // -> def add c
          'p': '添加页面' // -> def add p
        },
        'description': '对参数描述，不提供就默认'
      },
      'names': {
        'description': '对参数描述，不提供就默认'
      }
    },
  };

  // def dev [--options]
  Kit.dev = {
    'description': '',
    'action': function* (opts) {
      /*
       * opts:
       *   - base: 基准目录（默认：process.cwd()）
       *   - port: 服务器端口
       *   - ip: 服务器 ip 地址
       *   - host: 服务器 host 地址
       *   - tmpDir: 服务器临时目录
       * 其他调用 def.kit.reflect.start 时传递的参数都会合并到 opts 对象中
      */
      const abc = def.lookupABCJson();
      const builder = abc.assets.builder.name;

      yield def.kit.reflect.start({
        customServer: true,
        builderReflect: `${builder}/server.js`,
      });
    }
  };

  // def build [--options]
  // 除非有非常特殊的自定义逻辑，一般不建议自己实现，底层 core 已有统一实现
  Kit.build = {
    'description': '对命令描述',
    'action': function* (opts) {
      const abc = def.lookupABCJson();
      const { builder } = abc;

      yield def.kit.build.run({
        'builder': builder,
      });
    }
  };

  // def test [type] [--options]
  Kit.test = {
    'description': '',
    'options': {

    },
    'action': function* (type, opts) {

    }
  };

  // def publish
  // 除非有非常特殊的自定义逻辑，一般不建议自己实现，底层 core 已有统一实现
  const microStatus = get(SAAS_CONFIG, 'appType', false) === 'microapp' ? true : false;
  console.log(`开启微应用管理：${microStatus}`);
  if (microStatus) {
    Kit.publish = {
      'description': '对命令描述',
      '__force__': true, // 强制自定义 publish 命令
      'options': {
        'daily': { // 默认解析为 boolean
          "alias": 'd',
          'description': '日常发布'
        },
        'prod': {
          'alias': 'o',
          'description': '生成发布',
        }
      },
      'action': function* (type, opts) {
        if (!opts.daily && !opts.prod) {
          throw new Error('使用def p -d进行日常发布。使用def p -o进行正式发布')
        } else {
          try {
            process.env.cloudEnv = opts.prod ? 'prod' : 'daily';
            yield checkChildApp();
            if (opts.prod) {
              const yes = yield ask(def);
              if (!yes) {
                throw '终止发布';
              }
            }
            yield co(publish.bind(this, opts));
          } catch (err) {
            console.log('error:');
            console.log(chalk.red(err));
          }
        }
      }
    };
  }

  return Kit;
};
