const chalk = require('chalk');

module.exports = async (def) => {
  try {
    console.log('支付宝发布在路上哦');
    
  } catch (err) {
    console.log('error:');
    console.log(chalk.red(err));
  }
}