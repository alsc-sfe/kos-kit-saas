"use strict";
const fs = require('fs');
const ROOT_PATH = process.cwd();

try {
  // kos publish才需要使用package.json、app.config.ts
  // 直接使用require 文件路径不存在时， try catch无法捕获异常， process会中断，所以使用fs.readFileSync替代
  PKG = fs.readFileSync(path.join(ROOT_PATH, 'package.json')).toString();
  SAAS_CONFIG = fs.readFileSync(path.join(ROOT_PATH, 'app.config.ts')).toString();
  PKG = require(path.join(ROOT_PATH, 'package.json'));
  SAAS_CONFIG = require(path.join(ROOT_PATH, 'app.config.ts'));
} catch (err) {}

module.exports = function(kos) {

  const Kit = {};

  const abc = kos.lookupABCJson();
  const builderName = abc.assets.builder.name;

  // kos init cake [--options]
  Kit.init = {
    'action': function* (opts) {
      yield kos.kit.yo.run({
        generator: '@ali/generator-saas',
        argv:[]
      });
    }
  };

  // kos dev [--options]
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
       * 其他调用 kos.kit.reflect.start 时传递的参数都会合并到 opts 对象中
      */
      const abc = kos.lookupABCJson();
      const builder = abc.assets.builder.name;

      yield kos.kit.reflect.start({
        customServer: true,
        builderReflect: `${builder}/server.js`,
      });
    }
  };

  // kos build [--options]
  // 除非有非常特殊的自定义逻辑，一般不建议自己实现，底层 core 已有统一实现
  Kit.build = {
    'description': '对命令描述',
    'action': function* (opts) {
      const abc = kos.lookupABCJson();
      const { builder } = abc;

      if(builderName.includes('mini-program')){
        require('./mini-program/build')(kos);
      } else {
        yield kos.kit.build.run({
          'builder': builder,
        });
      }
    }
  };

  return Kit;
};
