const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function remindCast(cb) {
  var castIndex = 0;
  var remindDate = new Date().getTime() + 20 * 60000;
  common.spredCastModel.getNeedRemindCast(remindDate, function (err, fCasts) {
    if (err) {
      cb(err);
    } else {
      if (fCasts.length > 0) {

        fCasts.forEach(function (fCast) {
          httpHelper.sendMail(fCast.creator.email, 'remind-caster', {
            username: fCast.creator.pseudo,
            cast_name: fCast.name,
            cast_url: fCast.url
          }, function (err) {
            if (err) {
              cb(err);
            } else {
              common.spredcastReminderModel.getCastReminder(fCast._id, function (err, fReminders) {
                if (err) {
                  cb(err);
                } else {
                  var i = 0;
                  if (fReminders.length > 0) {
                    fReminders.forEach(function (fReminder) {
                      httpHelper.sendMail(fReminder.user.email, 'remind-viewer', {
                        username: fReminder.user.pseudo,
                        cast_name: fCast.name,
                        cast_url: fCast.url
                      }, function (err) {
                        if (err) {
                          cb(err);
                        } else {
                          i++;
                          if (i === fReminders.length) {
                            common.spredCastModel.reminded(fCast._id, function (err) {
                              if (err) {
                                cb(err);
                              } else {
                                castIndex++;
                                if (castIndex === fCasts.length) {
                                  cb();
                                }
                              }
                            });
                          }
                        }
                      });
                    });
                  } else {
                    common.spredCastModel.reminded(fCast._id, function (err) {
                      if (err) {
                        cb(err);
                      } else {
                        castIndex++;
                        if (castIndex === fCasts.length) {
                          cb();
                        }
                      }
                    });
                  }
                }
              });
            }
          });
        });
      } else {
        cb();
      }
    }
  });
}

function endCast(cb) {
  var endDate = new Date();
  endDate.setMinutes(endDate.getMinutes() + 15);
  common.spredCastModel.find({ state: 0, date: { $lt: endDate } }, function (err, fCasts) {
    if (err) {
      cb(err);
    } else if (fCasts.length == 0) {
      cb(null);
    } else {
      var i = 0;
      fCasts.forEach(function (fCast) {
        fCast.state = 3;
        fCast.save(function (err) {
          if (err) {
            cb(err);
          } else {
            if (i == fCasts.length - 1) {
              cb(null);
            }
            ++i;
          }
        });
      });
    }
  });
}

module.exports.remindCast = remindCast;
module.exports.endCast = endCast;