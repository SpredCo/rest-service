const vhost = require('vhost');
const config = require('config');
const devService = require('spred-dev-service');
const loginService = require('spred-login-service');
const apiService = require('spred-api-service');

function registerApp (masterApp, algoliaAddIndexFunc) {
  masterApp.use(vhost(config.get('devService.url'), devService.getApp(true, algoliaAddIndexFunc)));
  masterApp.use(vhost(config.get('loginService.url'), loginService.getApp(true, algoliaAddIndexFunc)));
  masterApp.use(vhost(config.get('apiService.url'), apiService.getApp(true, algoliaAddIndexFunc)));
}

module.exports.registerApp = registerApp;