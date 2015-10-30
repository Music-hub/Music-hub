var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var ejs = require('ejs');
var config = require('./config')

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/music-hub');

var User = require("./models/user")(mongoose);

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(morgan('combined'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(flash());
var sess = {
  secret: 'keyboard cat',
  cookie: {}
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id.toString());
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


var normalizedPath = require("path").join(__dirname, "./auth");

// inject auth strategys
var strategys = require("fs").readdirSync(normalizedPath).map(function(file) {
  return require("./auth/" + file);
});

var options = config.auth;

console.log(options)

strategys.forEach(function (strategy) {
  var strategyInstance = strategy.strategieFactory(User, options[strategy.name]);
  console.log(strategyInstance, 'test');
  passport.use(strategyInstance);
});

function requireAuth (req, res, next) {
  var sess = req.session;
  User.findOrCreate(sess.userId, function (err, userData) {
    if (err) {
      res.json({
        error: err
      })
      return;
    }
    if (userData.anonymous) {
      err = new Error('not logged in');
      res.json({
        error: err
      })
      return;
    }
    next();
  })
}

app.use(function (req, res, next) {
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
        return res.render('auth_error_callback', {
          errorMessage: err,
          authMethod: strategy.name
        });
      }
      var sess = req.session;
      console.log(sess, user._id.toString())
      sess.userId = user._id.toString();
      res.render('auth_success_callback', {userInfo: user.toObject()});
    }, 
    function (req, res, next, err, user, info) {
      console.log('login using ajax...');
      if (err || (!user)) {
        if (!user && !info) {
          info = {message: 'verifiction failed'}
        }
        err = (err || info.message).toString();
        return res.json({
          error :{
            errorMessage: err,
            authMethod: strategy.name
          }
        });
      }
      var sess = req.session;
      console.log(sess, user._id.toString())
      sess.userId = user._id.toString();
      res.json({
        userInfo: user.toObject()
      });
    }
  );
})

app.post('/register/email', function (req, res, next) {
  var user,
    body = req.body,
    email = body.email,
    password =body.password
  
  var sess = req.session;
  if (!(email || password)) {
    return res.end('error');
  }
  
  user = User.findOrCreate({_id: sess.userId}, function (err, userData) {
    if (err) {
      res.json({
        error: err
      })
    } else {
      userData.authMethods.email.email = email;
      userData.authMethods.email.password = password;
      userData.anonymous = false;
      userData.save(function (err, doc) {
        if (err) {
          return res.json({
            error: err
          })
        }
        res.json({
          userInfo: doc.toObject()
        });
      })
    }
  });
  
})

app.post('/api/user/change-setting', requireAuth, function (req, res, next) {
  var user;
  var fields = ['name'];
  var updates = {};
  var sess = req.session;
  console.log(sess);
  user = User.findOrCreate({
    _id: sess.userId
  }, function (err, userData) {
    if (err) {
      res.json({
        error: err.toString()
      })
    }
    if (userData.anonymous) {
      err = new Error('not_sign_in')
      return res.json({
        error: err.toString()
      })
    }
    fields.forEach(function (name) {
      if (req.body[name])
        userData[name] = req.body[name]
    })
    userData.save(function (err, userData) {
      if (err) {
        return res.json({
          error: err
        })
      }
      res.json({
        userInfo: userData.toObject()
      });
    })
  })
})

app.use(express.static(path.resolve(__dirname, 'public')));

server.listen(config.port, config.ip, function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});



//fix exit Handler
process.stdin.resume();//so the program will not close instantly
process.nextTick(function() {
    function exitHandler(options, err) {
        if (options.cleanup) console.log('clean');
        if (err) console.log(err.stack);
        if (options.exit) {
            process.nextTick(function() {
                process.exit();
                //make sure a clear shut down and will not exit until all exit call finished
            })
            
        };
    }

    //do something when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
});

