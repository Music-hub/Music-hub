var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var emailAuth = {
  name: 'email',
  strategy: 'local',
  dataSchema: {
    email: { type: String, default: '' },
    password: { type: String, default: '' }
  },
  strategieFactory: function (User, options) {
    return new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },function(email, password, done) {
      console.log(email, password, 'test')
      User.findOne({ "authMethods.email.email": email }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        if (user.authMethods.email.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    });
  },
  setupRoute: function (app, User, strategy, loginEntryPoint, loginCallback, ajaxCallback) {
    app.post(loginEntryPoint,
      function(req, res, next) {
        passport.authenticate(strategy, loginCallback.bind(null, req, res, next))(req, res, next);
      });
    app.post(loginEntryPoint + '/json',
      function(req, res, next) {
        passport.authenticate(strategy, ajaxCallback.bind(null, req, res, next))(req, res, next);
      });
  }
}

module.exports = emailAuth;