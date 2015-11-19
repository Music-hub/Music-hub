var passport = require('passport')
  , crypto = require('crypto')
  , LocalStrategy = require('passport-local').Strategy;

var salt = null;

var emailAuth = {
  name: 'email',
  strategy: 'local',
  dataSchema: {
    email: { type: String, default: '' },
    password: { type: String, default: '' }
  },
  methods: {
    setEmailPassword: function setPassword(password) {
      this.authMethods.email.password = crypto.pbkdf2Sync(password, salt, 4096, 64);
    },
    checkEmailPassword: function checkPassword(password){
      return this.authMethods.email.password == crypto.pbkdf2Sync(password, salt, 4096, 64);
    }
  },
  strategieFactory: function (User, options) {
    salt = options.salt;
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
        if (!user.checkEmailPassword(password)) {
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