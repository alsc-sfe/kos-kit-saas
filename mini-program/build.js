const chalk = require('chalk');

module.exports = async (def) => {
  try {
    const buildType = await def.ui.list('请选择构建类型：', [{
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
    },
    {
      'name': 'ALL 全部',
      'value': 'all',
    }], false);

    const abc = def.lookupABCJson();
    const builderName = abc.assets.builder.name;
    // require(`./${buildType}`)(def);
    process.env.buildType = buildType;
    process.env.defPubType = 'prod';

    await def.kit.reflect.start({
        customServer: true,
        builderReflect: `${builderName}/server.js`,
    });
  } catch (err) {
    console.log('error:');
    console.log(chalk.red(err));
  }
}