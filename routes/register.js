
var mongoose = require('mongoose');
var PendingEmail = require("../models/pending_email")(mongoose);
var User = require("../models/user")(mongoose);


// Load Events
var RegisterError = require("../events/register_error");
var RegisterInfo = require("../events/register_info");
var RegisterSuccess = require("../events/register_success");
var DatabaseError = require("../events/database_error");

function setup (app ,config, service, io) {
  var EmailSender = service.EmailSender;
  
  app.post('/register/email', function (req, res, next) {
    var user,
      body = req.body,
      email = body.email
    
    var sess = req.session;
    if (!(email)) {
      return res.json(new RegisterError('email', null, "Empty email"));
    }
    PendingEmail.findOrCreate({
      email: email
    }, function (err, pendingEmail) {
      
      if (err) return res.json(new DatabaseError('email', null, err.toString()));
      
      pendingEmail.refreshToken();
      pendingEmail.pSave()
      .then(function (pendingEmail) {
        var path = config.siteBase + '?register-token=' + pendingEmail.token
        EmailSender.sendMail({
          from: 'Music Hub <' + config.gmail.GMAIL_ACCOUNT + '>', // sender address
          to: pendingEmail.email, // list of receivers
          subject: '[Register] Music hub, the online music sheet service', // Subject line
          text: 'please open ' + path +' to continue your register', // plaintext body
          html: '<b>please open <a href="' + path + '">' + path + '</a> to continue your register</b>' // html body
        }, function(err, info){
          if (err) return res.json(new RegisterError('email', null, err.toString()));
          return res.json(
            new RegisterInfo('email', null, "sent email. Please check your mail box")
          )
        });
      })
      .catch(function (err) {
        return res.json(new RegisterError('email', null, err.toString()));
      })
    })
  })
  app.get('/register/email/:token', function (req, res, next) {
    var token = req.params.token;
    
    PendingEmail.findOne({
      token: token
    }, function (err, pendingEmail) {
      if (err) return res.json(new DatabaseError('email', null, err.toString()));
      if(!pendingEmail){
        return res.json(new RegisterError('email', null, "invalid register link"))
      }
      return res.json(new RegisterInfo(
        'email', 
        pendingEmail.toObject(), 
        "pending email: " + pendingEmail.email 
      ));
    })
  })
  
  app.post('/register/email/:token', function (req, res, next) {
    var token = req.params.token;
    var name = req.body.name;
    var password = req.body.password;
    
    PendingEmail.findOne({
      token: token
    }, function (err, pendingEmail) {
      if (err) return res.json(new DatabaseError('email', null, err.toString()));
      if(!pendingEmail){
        return res.json(new RegisterError('email', null, "invalid register link"))
      }
      
      User.findOne( {
        "authMethods.email.email": pendingEmail.email
      }, function (err, user) {
        if (err) return res.json(new DatabaseError('email', null, err.toString()));
        
        if(user){
          return res.json(new RegisterError('email', null, 'already registered email'));
        }
        
        user = new User({
          name: name,
          anonymous: false,
          "authMethods.email.email": pendingEmail.email
        });
        user.setEmailPassword(password);
        
        user.pSave()
        .then(function (user) {
          return res.json(new RegisterSuccess('email', user.toClientObject(), null));
        })
        .catch(function (err) {
          return res.json(new DatabaseError('email', null, err.toString()));
        })
        
      })
      
    })
  });

}

module.exports = setup;