var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

var facebookAuth = {
  name: 'facebook',
  strategy: 'facebook',
  dataSchema: {
    id: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    profile: {}
  },
  strategieFactory: function (User, options) {
    return new FacebookStrategy({
      clientID: options.FACEBOOK_APP_ID,
      clientSecret: options.FACEBOOK_APP_SECRET,
      callbackURL: options.callbackURL,
      enableProof: false
    },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ "authMethods.facebook.id": profile.id }, function (err, user) {
          if (err) return done(err);
          console.log(profile)
          user.authMethods.facebook = {
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
      passport.authenticate('facebook', { display: 'popup' }));
    
    app.get(loginEntryPoint + '/callback',
      function(req, res, next) {
        passport.authenticate('facebook', loginCallback.bind(null, req, res, next))(req, res, next);
      });
  }
}

module.exports = facebookAuth;