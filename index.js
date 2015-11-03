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
var nodemailer = require('nodemailer');
var config = require('./config')

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/music-hub');

// Load Events
var AuthError = require("./events/auth_error");
var SettingSuccess = require("./events/setting_success");
var SettingError = require("./events/setting_error");

// Load models
var User = require("./models/user")(mongoose);

// Setup server
var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

server.on('error', console.error.bind(console));

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


var service = {
  EmailSender: nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: config.gmail.GMAIL_ACCOUNT,
          pass: config.gmail.GMAIL_PASSWORD
      }
  })
}

var authRouteSetup = require("./routes/auth");
var registerRouteSetup = require("./routes/register");

authRouteSetup(app, config, service);
registerRouteSetup(app, config, service);

function requireAuth (req, res, next) {
  var sess = req.session;
  User.findOrCreate({
    _id: sess.userId
  }, function (err, userData) {
    console.log('test', userData);
    if (err) {
      res.json({
        error: err
      })
      return;
    }
    if (userData.anonymous) {
      res.json(new AuthError(null, null, 'not logged in'));
      return;
    }
    next();
  })
}
  
app.post('/api/user/change-setting', requireAuth, function (req, res, next) {
  var user;
  var fields = ['name'];
  var updates = {};
  var sess = req.session;
  console.log(sess);
  user = User.findOrCreate({
    _id: sess.userId
  }, function (err, userData) {
    if (err) return res.json(new SettingError(null, null, err.toString()));
    
    fields.forEach(function (name) {
      if (req.body[name])
        userData[name] = req.body[name]
    })
    userData.save(function (err, userData) {
      if (err) return res.json(new SettingError(null, null, err.toString()));
      res.json(new SettingSuccess(null, userData.toObject(), null));
    })
  })
})

app.use(express.static(path.resolve(__dirname, 'public')));

server.listen(config.port, config.ip, function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
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

