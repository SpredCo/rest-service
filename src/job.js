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
          httpHelper.sendMail(fCast.creator.email, 'remindCaster', {
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
                      httpHelper.sendMail(fCast.creator.email, 'remindViewer', {
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

module.exports.remindCast = remindCast;