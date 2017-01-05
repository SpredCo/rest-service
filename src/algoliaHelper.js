const async = require('async');
const logger = require('winston');
const common = require('spred-common');
const algoliaSearch = require('algoliasearch');

var client;
var globalIndex;
var tagIndex;
var userIndex;
var castIndex;

function init() {
  logger.info('Intializing algolia search engine ...');
  client = algoliaSearch('KGZYQKI2SD', '5363665898cdaa3fef7b751b1d46717d');
  globalIndex = client.initIndex('global');
  userIndex = client.initIndex('users');
  tagIndex = client.initIndex('tags');
  castIndex = client.initIndex('casts');
}

function indexAll(cb) {
  logger.info('Indexing users ...');
  common.userModel.find({}, function (err, fUsers) {
    if (err) {
      cb(err);
    } else {
      var users = [];
      fUsers.forEach(function (user) {
        users.push({
          type: 'user',
          pseudo: '@' + user.pseudo,
          name: '@' + user.pseudo,
          fistname: user.firstName,
          lastname: user.lastName,
          objectID: user._id
        });
      });
      logger.info('Indexing tags ...');
      common.tagModel.getAll(function (err, fTags) {
        if (err) {
          cb(err);
        } else {
          var tags = [];
          fTags.forEach(function (tag) {
            tags.push({
              type: 'tag',
              name: '#' + tag.name,
              objectID: tag._id
            });
          });

          logger.info('Indexing spredcasts ...');
          var casts = [];
          common.spredCastModel.find({ isPublic: true }, function (err, fCats) {
            if (err) {
              cb(err);
            } else {
              fCats.forEach(function (cast) {
                casts.push({
                  type: 'cast',
                  name: cast.name,
                  url: cast.url,
                  objectID: cast._id
                });
              });
              var allIndex = users.concat(tags, casts);
              globalIndex.addObjects(allIndex, function (err) {
                if (err) {
                  cb(err);
                } else {
                  userIndex.addObjects(users, function (err) {
                    if (err) {
                      cb(err);
                    } else {
                      tagIndex.addObjects(tags, function (err) {
                        if (err) {
                          cb(err);
                        } else {
                          castIndex.addObjects(casts, function (err) {
                            if (err) {
                              cb(err);
                            } else {
                              cb();
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}

function addIndex(indexes, objects, cb) {
  logger.info('Adding object to algolia ...');
  async.waterfall([
    function (callback) {
      if (indexes.indexOf('global') != -1) {
        globalIndex.addObjects(objects, function (err) {
          callback(err);
        });
      } else {
        callback(null);
      }
    },
    function (callback) {
      if (indexes.indexOf('user') != -1) {
        userIndex.addObjects(objects, function (err) {
          callback(err);
        });
      } else {
        callback(null);
      }
    },
    function (callback) {
      if (indexes.indexOf('tag') != -1) {
        tagIndex.addObjects(objects, function (err) {
          callback(err);
        });
      } else {
        callback(null);
      }
    },
    function (callback) {
      if (indexes.indexOf('cast') != -1) {
        castIndex.addObjects(objects, function (err) {
          callback(err);
        });
      } else {
        callback(null);
      }
    }
  ], function (err) {
    cb(err);
  });
}

module.exports.init = init;
module.exports.indexAll = indexAll;
module.exports.addIndex = addIndex;