const fetch = require('node-fetch');
const querystring = require('querystring');

const { DEF_SERVER } = require('./config');

const ajaxWrapper = ({ method = 'GET', url, param }) => {
  const API_URL = DEF_SERVER[process.env.cloudEnv];
  return new Promise((resolve, reject) => {
    let requestUrl = API_URL + url;
    const requestData = {
      method,
      headers: { 'Content-type': 'application/json' },
    };
    if (method === 'GET') {
      requestUrl = `${requestUrl}?${querystring.stringify(param)}`;
    } else {
      requestData.body = JSON.stringify(param);
    }
    // console.log(requestUrl);
    // console.log(requestData);
    fetch(requestUrl, {
      ...requestData
    }).then(async (res) => {
      const result = await res.json();
      const { success, data } = result;
      if (success) {
        resolve({ data });
      } else {
        reject(result);
      }
    });
  });
}

const fetchCheckChildApp = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',
    url: '/def/checkChildApp',
    param,
  });
};

const getRouter = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',
    url: '/def/getRouter',
    param,
  });
};

const pushAssets = (param = {}) => {
  return ajaxWrapper({
    method: 'POST',
    url: '/def/pushAssets',
    param,
  });
};

module.exports = {
  fetchCheckChildApp,
  getRouter,
  pushAssets,
};
