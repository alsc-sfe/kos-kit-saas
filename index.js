"use strict";

const chalk = require('chalk');
const opn = require('opn');
const get = require('lodash/get');
const portfinder = require('portfinder');
const co = require('co');
const ROOT_PATH = process.cwd();
const SAAS_CONFIG = require(path.join(ROOT_PATH, 'saas.config.js'));
const PKG = require(path.join(ROOT_PATH, 'package.json'));
const { getRouter, fetchCheckChildApp } = require('./micro/fetch');

const publish = require('./micro/publish');

const ask = (def) => def.ui.list('确定执行线上发布, 执行后不可撤销, 请谨慎操作！！！', [{
  'name': '再检查检查',
  'value': false,
},
{
  'name': '确定线上发布',
  'value': true,
}], false);

const checkSassConfig = function* () {
  const microStatus = get(SAAS_CONFIG, 'microConfig.status', false);
  if (microStatus) {
    const appKey = get(SAAS_CONFIG, 'microConfig.appKey', false);
    const name = get(PKG, 'name', '');
    if (!appKey) throw '请在sass.config.js中设置appKey';
    yield checkChildApp({ appKey, name });
    yield checkRouter(appKey);
  }
}

const checkChildApp = function* (param) {
  const res = yield fetchCheckChildApp(param);
  if (!res.data) throw '请检查saas.config.js中的appKey, package.json中的name是否和微信管理平台一致';
}

const checkRouter = function* (appKey) {
  let saasRouters = [];
  const pages = get(SAAS_CONFIG, 'page', {});
  const res = yield getRouter({ appKey });
  const microRouters = res.data.map(item => item.app_child_router_name);
  Object.keys(pages).forEach(item => saasRouters.push(pages[item].route));
  if (saasRouters.sort().toString() !== microRouters.sort().toString()) throw 'sass.config.js中配置的router与微应用平台不一致';
}

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
      // if (microStatus && cmd === 'publish' && (opts.daily || opts.prod)) {}
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
          process.env.cloudEnv = opts.prod ? 'daily' : 'prod';
          yield checkSassConfig();
          if (opts.prod) {
            const yes = yield ask(def);
            if (!yes) {
              throw '终止发布';
            }
          }
          yield co(publish.bind(this, opts));
        } catch (err) {
          console.log('err:');
          console.error(err);
        }
      }
    }
  };

  return Kit;

};
