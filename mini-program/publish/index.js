const chalk = require('chalk');

module.exports = async (def) => {
  try {
    const publishType = await def.ui.list('请选择发布类型：', [
      {
        'name': '组件',
        'value': 'component',
      }, {
        'name': '微信',
        'value': 'wx',
      },
      {
        'name': '支付宝',
        'value': 'alipay',
      },
      {
        'name': 'H5',
        'value': 'h5',
      }], false);
    require(`./${publishType}`)(def);
  } catch (err) {
    console.log('error:');
    console.log(chalk.red(err));
  }
}