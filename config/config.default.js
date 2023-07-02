/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1686661805359_1227'

  // add your middleware config here
  config.middleware = ['errorHandler']

  config.errorHandler = {
    match: '/api'
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/youtube-clone',
      options: {
        useUnifiedTopology: true
      }
    }
  }

  config.security = {
    csrf: {
      enable: false
    }
  }

  config.jwt = {
    secretKey: 'f4f51561-06f3-4e37-9e8d-66d7e9a3a6c8',
    expiresIn: '1d'
  }

  config.cors = {
    origin: '*', // 或者 origin: '*'  *代表所有来源都可访问
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS' //允许的请求方式  get、post等基本请求方式不需要设置
  }

	
  return {
    ...config,
    ...userConfig
  }
}
