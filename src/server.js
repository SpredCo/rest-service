const config = require('config');
const logger = require('winston');
const express = require('express');
const mongoose = require('mongoose');
const slackTransport = require('slack-transport');
const algoliaHelper = require('./algoliaHelper');
const jobs = require('./job');

const appLoader = require('./app');

var masterApp = null;

function initializeLogger () {
  logger.info('Initializing logger ...');
  logger.add(logger.transports.File, {filename: config.get('logFile'), json: false});
  logger.add(slackTransport, { webHook: 'https://hooks.slack.com/services/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'});
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

  appLoader.registerApp(masterApp, algoliaHelper.addIndex);

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
      algoliaHelper.init();
      initializeApp();
    }
  });
}

function initAlgolia () {
  initializeLogger();

  logger.info('Starting algolia indexing ...');

  initializeDatabaseConnection(function (err) {
    if (err) {
      process.exit(1);
    } else {
      algoliaHelper.init();
      algoliaHelper.indexAll(function (err) {
        if (err) {
          logger.error(err);
        } else {
          logger.info('Done !');
          process.exit(0);
        }
      });
    }
  });
}

function doJobs () {
  initializeLogger();

  logger.info('Starting cron ...');

  initializeDatabaseConnection(function (err) {
    if (err) {
      process.exit(1);
    } else {
      jobs.remindCast(function (err) {
        if (err) {
          console.error(err);
          process.exit(1);
        } else {
          jobs.endCast(function (err) {
            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              console.log('Done !');
              process.exit(0);
            }
          });
        }
      });
    }
  });
}

module.exports.start = start;
module.exports.initAlgolia = initAlgolia;
module.exports.doJobs = doJobs;