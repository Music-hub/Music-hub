var mongoose = require('mongoose');
var User = require("../models/user")(mongoose);

var AuthError = require("../events/auth_error");
var SettingError = require("../events/setting_error");
var SettingInfo = require("../events/setting_info");
var SettingSuccess = require("../events/setting_success");
var DatabaseError = require("../events/database_error");


function setup(app, config, service) {
  
  function requireAuth (req, res, next) {
    var sess = req.session;
    User.findOrCreate({
      _id: sess.userId
    }, function (err, userData) {
      console.log('test', userData);
      if (err) return new DatabaseError(null, null, err.toString());
      if (userData.anonymous) {
        res.json(new AuthError(null, null, 'not logged in'));
        return;
      }
      next();
    })
  }
  
  app.get('/setting/get', requireAuth, function (req, res ,next) {
    var user, sess = req.session;
      
    User.findOrCreate({
      _id: sess.userId
    }, function (err, userData) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      User.populate(userData, {path: "sheets", select: "name"}, function (err, user) {
        if (err)  return res.json(new DatabaseError(null, null, err.toString()));
        res.json(new SettingInfo(null, user.toClientObject(), null));
      })
    });
  })
  
  app.post('/setting/update', requireAuth, function (req, res ,next) {
    var user;
    var fields = ['name'];
    var updates = {};
    var sess = req.session;
    console.log(sess);
    user = User.findOrCreate({
      _id: sess.userId
    }, function (err, userData) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      
      fields.forEach(function (name) {
        if (req.body[name])
          userData[name] = req.body[name]
      })
      userData.save(function (err, userData) {
        if (err) return res.json(new DatabaseError(null, null, err.toString()));
        res.json(new SettingSuccess(null, userData.toClientObject(), null));
      })
    })
  })
}

module.exports = setup;