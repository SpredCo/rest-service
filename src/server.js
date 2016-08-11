const config = require('config');
const logger = require('winston');
const express = require('express');
const mongoose = require('mongoose');

const appLoader = require('./app');

var masterApp = null;

function initializeLogger () {
  logger.info('Initializing logger ...');
  logger.add(logger.transports.File, {filename: config.get('logFile'), json: false});
  logger.info('Logger initialized');
}

function initializeDatabaseConnection (cb) {
  logger.info('Connecting to database ...');

  mongoose.connection.on('error', function (err) {
    logger.error('Unable to connect to the database ...');
    logger.error(err);
    cb(err);
  });

  mongoose.connection.on('open', function () {
    logger.info('Connection success !');
    cb();
  });

  const connectionStr = 'mongodb://' + config.get('dbConfig.host') + ':' +
    config.get('dbConfig.port') + '/' +
    config.get('dbConfig.dbName');
  mongoose.connect(connectionStr);
}

function initializeApp () {
  logger.info('Initializing apps ...');
  masterApp = express();
  logger.info('Master app initialized');

  appLoader.registerApp(masterApp);

  logger.info('Starting http server...');
  masterApp.listen(config.get('server.port'), function () {
    logger.info('Services started on port ' + config.get('server.port') + ' !');
  });
}

function start () {
  initializeLogger();

  logger.info('Starting services ...');

  initializeDatabaseConnection(function (err) {
    if (err) {
      process.exit(1);
    } else {
      initializeApp();
    }
  });
}

module.exports.start = start;