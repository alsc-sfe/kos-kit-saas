const childProcess = require('child_process');
const get = require('lodash/get');
const ROOT_PATH = process.cwd();
const PKG = require(path.join(ROOT_PATH, 'package.json'));

const branch = childProcess.execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT_PATH }).toString().replace(/\s+/, '');
const url = get(PKG, 'repository.url', '');
const name = get(PKG, 'name', '');

module.exports = {
  url,
  branch,
  name,
};