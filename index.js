"use strict";

const chalk = require('chalk');
const open = require('open');
const portfinder = require('portfinder');

module.exports = function(def) {

  const Kit = {};

  // hooks.
  Kit.hooks = {
    'before': function* (cmd, args, opts) {
      // 在正式执行命令前的前置操作

      // throw new Error('msg'); // 抛出异常，将不再执行相关命令，包括 after hook 也不会执行

      // return false; // 返回 false，将不再执行相关命令，继续执行 after hook

      // return true; // 返回 true，继续执行相关命令，包括 after hook
    },
    'after': function* (cmd, args, opts) {
      // 可以执行一些命令清理工作
    }
  };

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
    'action': function* (type, names, opts) {
      /*
       * type: 类型（choices 中提供的 key）
       *   = c
       *   = p
       * names: 名称（一个数组）
       * opts: 选项 map
       */
    }
  };

  // def dev [--options]
  Kit.dev = {
    'description': '',
    // 'options': {
    //   'sim': {
    //     "alias": 's',
    //     'description': '开启模拟器调试'
    //   }
    // },
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

      let refletParams = {
        builderReflect: `${builder}/reflect.js`,
        port: yield portfinder.getPortPromise(),
        ip: '127.0.0.1',
        host: 'local.alipay.net',
        customLivereLoad: true,
        livereload: false,
      };

      yield def.kit.reflect.start(refletParams);
      def.log.info(chalk.yellow('打开入口页面进行调试:'));
      open(`http://local.alipay.net:${refletParams.port}/index.html?#/index`);
      def.log.info(chalk.yellow(`http://local.alipay.net:${refletParams.port}`));
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
  /*
   Kit.publish = {
     'description': '对命令描述',
     '__force__': true, // 强制自定义 publish 命令
     'action': function* (opts) {

     }
   };
  */

  return Kit;

};
