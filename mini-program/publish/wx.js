const chalk = require('chalk');
const path = require('path');
const ROOT_PATH = process.cwd();
const exec = require('child_process').exec;
const cli = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';

module.exports = async (def) => {
  try {
    // ? 是否应该上传git仓库的代码，目前上传的是本地的
    const cwd = path.join(ROOT_PATH, 'src');
    const version = require(path.join(ROOT_PATH, 'package.json')).version;

    console.log('开始微信上传, version:', version);
    const ps = exec(`${cli} -u ${version}@${cwd}`, {
      cwd,
    }, (err) => {
      if (err) {
        console.error(`微信上传失败: ${err}`);
        return;
      } else {
        console.log('微信上传成功');
      }
    });
    ps.stdout.on('data', (data) => {
      console.log(data);
    });
  } catch (err) {
    console.log('error:');
    console.log(chalk.red(err));
  }
}