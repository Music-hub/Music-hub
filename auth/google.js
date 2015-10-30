var passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var googleAuth = {
  name: 'google',
  strategy: 'google',
  dataSchema: {
    id: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    profile: {}
  },
  strategieFactory: function (User, options) {
    return new GoogleStrategy({
        clientID: options.GOOGLE_CLIENT_ID,
        clientSecret: options.GOOGLE_CLIENT_SECRET,
        callbackURL: options.callbackURL
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({  "authMethods.google.id": profile.id }, function (err, user) {
          if (err) return done(err);
          console.log(profile)
          user.authMethods.google = {
            id: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            profile: profile
          }
          if (user.anonymous) {
            user.anonymous = false;
            user.name = profile.displayName
          }
          return user.pSave(done);
        });
      }
    )
  }, 
  setupRoute: function (app, User, strategy, loginEntryPoint, loginCallback, ajaxCallback) {
    app.get(loginEntryPoint,
      passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
    
    app.get(loginEntryPoint + '/callback', 
      function(req, res, next) {
        passport.authenticate('google', loginCallback.bind(null, req, res, next))(req, res, next);
      }
    );
  }
}

module.exports = googleAuth;