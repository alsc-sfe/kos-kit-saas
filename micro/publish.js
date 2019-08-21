const chalk = require('chalk');

function handlePublish(param) {
  console.log('---def log---');
  console.log('正在同步迭代数据到微应用管理平台。。。');
  console.log(JSON.stringify(param, null, 2));

  const { pushAssets } = require('./fetch');
  return new Promise((resolve, reject) => {
    pushAssets(param).then(res => {
      console.log(chalk.green('数据同步成功'));
      console.log(chalk.green('发布完成'));
      resolve('数据同步成功');
    }).catch((err) => {
      console.log(chalk.red('迭代数据同步到微应用管理平台失败!!!'));
      console.log(err);
      reject('迭代数据同步到微应用管理平台失败!!!');
    });
  });
}

function* publish(opts) {
  const defpub = require('@ali/def-pub-client');
  const gitConfig = require('./git');

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
    client.on('success', async (result) => {
      /**
       * result.task_url 任务地址
       * result.files [] 本次发布的 assets 资源列表，非 assets 发布类型该字段为空
       * result.build {url: 'tar.gz', md5: ''} 代码构建结果的压缩包地址和 md5
       *  */
      try {
        const param = {
          gitConfig,
          oss: result.build.url,
          target: opts.prod ? 'prod' : 'daily',
        };
        await handlePublish(param);
      } catch (err) {
        throw err;
      }
    });
    // run 方法中传入发布仓库信息
    const target = opts.prod ? 'prod' : 'daily';
    
    if (!gitConfig.url) {
      reject('请在package.json中填写git url');
      return;
    }

    const param = {
      ticket: ticket,
      repo: gitConfig.url,
      branch: gitConfig.branch,
      target,
      hideBuildMessage: true,
    };
    client.run(param);
  });
};

module.exports = publish;