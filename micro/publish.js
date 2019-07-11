const defpub = require('@ali/def-pub-client');
const get = require('lodash/get');
const gitConfig = require('./git');
const { pushAssets } = require('./fetch');
const ROOT_PATH = process.cwd();
const SAAS_CONFIG = require(path.join(ROOT_PATH, 'saas.config.js'));
const microStatus = get(SAAS_CONFIG, 'microConfig.status', false);
const pages = get(SAAS_CONFIG, 'page', {});

function* publish(opts) {
  // 第一步：获取用户身份信息
  const ticket = yield defpub.login();

  yield new Promise((resolve, reject) => {
    // 第二步：调用client，监听相应事件
    const client = new defpub.Client();
    client.on('start', (options) => {
      // console.log('提交到服务端发布');
    })
    client.on('message', (msg) => {
      // 发布过程的日志事件，会触发多次。(如果需要显示进度条等信息请查看下文 QA)
      console.log('', msg);
    });
    client.on('build_message', (msg) => {
      // 容器标准输出流日志，直接传入命令行的标准输出流
      process.stdout.write(`${msg}`);
    });
    client.on('error', (error) => {
      // 发布失败，从 error.message 中读取错误信息
      reject(error);
    });
    client.on('success', (result) => {
      // 发布成功
      // result.task_url 任务地址
      // result.files [] 本次发布的 assets 资源列表，非 assets 发布类型该字段为空
      // result.build {url: 'tar.gz', md5: ''} 代码构建结果的压缩包地址和 md5
      // 微平台发布
      if (microStatus) {
        const assetsFile = result.files.find((item) => item.endsWith('/assets.json'));
        if (!assetsFile) reject('微应用平台发布失败');
        const appKey = get(SAAS_CONFIG, 'microConfig.appKey', false);
        const param = {
          appKey,
          gitConfig,
          assets: result.files,
          assetsFile,
          pages,
        };
        pushAssets(param).then(res => {
          resolve('微平台数据写入成功');
        });
      } else {
        resolve(result);
      }
    });
    // run 方法中传入发布仓库信息
    const target = opts.prod ? 'prod' : 'daily';
    
    if (!gitConfig.url) {
      reject('请在package.json中填写git url');
      return;
    }
    if (!gitConfig.branch || gitConfig.branch === 'master') {
      reject('git分支不允许发布');
      return;
    }

    const param = {
      ticket: ticket,
      repo: gitConfig.url,
      branch: gitConfig.branch,
      target,
      hideBuildMessage: true,
    };
    // console.log(JSON.stringify(param, null, 2));
    client.run(param);
  });
};

module.exports = publish;