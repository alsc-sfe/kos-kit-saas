const chalk = require('chalk');
const ROOT_PATH = process.cwd();
const exec = require('child_process').exec;


module.exports = async (def) => {
  try {
    console.log('开始npm beta 发布');
    const ps = exec(`cd ${ROOT_PATH}  && tnpm publish --tag beta`, (err) => {
      if (err) {
        console.error(`npm beta 发布失败: ${err}`);
        return;
      } else {
        console.log('npm beta 发布成功');
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