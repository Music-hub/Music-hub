var passport = require('passport');
var mongoose = require('mongoose');

// Load Events
var LoginError = require("../events/login_error");
var LoginSuccess = require("../events/login_success");

// Load models
var User = require("../models/user")(mongoose);

function setup(app, config, service, io) {
    
  app.use(passport.initialize());
  app.use(passport.session());
  
  // setup auth methods
  passport.serializeUser(function(user, done) {
    done(null, user._id.toString());
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
  // setup email service
  var EmailSender = service.EmailSender;
  
  var normalizedPath = require("path").join(__dirname, "../auth");
  
  // inject auth strategys
  var strategys = require("fs").readdirSync(normalizedPath).map(function(file) {
    return require("../auth/" + file);
  });
  
  // setup auth methods
  var options = config.auth;
  
  strategys.forEach(function (strategy) {
    var strategyInstance = strategy.strategieFactory(User, options[strategy.name]);
    // console.log(strategyInstance, 'test');
    passport.use(strategyInstance);
  });
  
  app.use(function (req, res, next) {
    console.log('session id in express is...' + req.sessionID);
    var sess = req.session;
    if (!sess.userId) {
      sess.userId = (new mongoose.Types.ObjectId).toString();
    }
    next();
  })
  
  strategys.forEach(function (strategy) {
    strategy.setupRoute(
      app, 
      User, 
      strategy.strategy, 
      '/auth/' + strategy.name, 
      function (req, res, next, err, user, info) {
        console.log('after auth ........')
        if (err || (!user)) {
          if (!user && !info) {
            info = {message: 'verifiction failed'}
          }
          err = (err || info.message).toString();
          return res.render('auth_callback', {
            event: new LoginError(strategy.name, null, info.message)
          });
        }
        var sess = req.session;
        console.log(sess, user._id.toString())
        sess.userId = user._id.toString();
        
        User.populate(user, {path: "sheets"}, function (err, user) {
          if (err) return res.render('auth_callback', {
            event: new LoginError(strategy.name, null, err.stack)
          });
          res.render('auth_callback', {
            event: new LoginSuccess(strategy.name, user.toClientObject(), null)
          });
        })
        
      }, 
      function (req, res, next, err, user, info) {
        console.log('login using ajax...');
        if (err || (!user)) {
          if (!user && !info) {
            info = {message: 'verifiction failed'}
          }
          err = (err || info.message).toString();
          return res.json(new LoginError(strategy.name, null, info.message));
        }
        var sess = req.session;
        console.log(sess, user._id.toString())
        sess.userId = user._id.toString();
        res.json(new LoginSuccess(strategy.name, user.toClientObject(), null));

        User.populate(user, {path: "sheets"}, function (err, user) {
          if (err) return res.json(new LoginError(strategy.name, null, err.stack));
          res.json(new LoginSuccess(strategy.name, user.toClientObject(), null));
        })
      }
    );
  })
}
module.exports = setup;