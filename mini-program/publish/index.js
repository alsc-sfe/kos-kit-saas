const chalk = require('chalk');

module.exports = async (def) => {
  try {
    const publishType = await def.ui.list('请选择发布类型：', [
      {
        'name': '组件 beta发布',
        'value': 'tnpm-beta',
      }, {
        'name': '组件 正式发布',
        'value': 'tnpm-prod',
      },
      {
        'name': '支付宝',
        'value': 'alipay',
      },
      {
        'name': '微信',
        'value': 'wx',
      },
      {
        'name': 'H5 日常发布',
        'value': 'h5-daily',
      },
      {
        'name': 'H5 生产发布',
        'value': 'h5-prod',
      }], false);
    require(`./${publishType}`)(def);
  } catch (err) {
    console.log('error:');
    console.log(chalk.red(err));
  }
}