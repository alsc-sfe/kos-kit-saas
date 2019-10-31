const chalk = require('chalk');
const path = require('path');
const ROOT_PATH = process.cwd();
const spawn = require('child_process').spawn;


module.exports = async (def) => {
  try {
    const defPubType = await def.ui.list('请选择组件发布类型：', [
      {
        'name': 'tnpm/npm beta',
        'value': 'tnpm-beta',
      }, {
        'name': 'tnpm/npm prod',
        'value': 'tnpm-prod',
      }], false);

    const abc = def.lookupABCJson();
    const builderName = abc.assets.builder.name;
    process.env.defPubType = defPubType;
    await def.kit.reflect.start({
      customServer: true,
      builderReflect: `${builderName}/server.js`,
    });
  } catch (err) {
    console.log('error:');
    console.log(chalk.red(err));
  }
}