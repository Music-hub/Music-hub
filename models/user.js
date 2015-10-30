var singleton = require("../utils/singleton");
var ChannelModelFactory = require("./channel");
var Q = require('q');
var FB = require('fb');

var UserModelFactory = function (mongoose) {
  var Channel = ChannelModelFactory(mongoose);
  
  var userSchema, User;
  var nooz = function () {}
  
  userSchema = new mongoose.Schema({
    name: { type: String, default: 'Anonymous' },
    /*
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    facebook: { type: String, default: '' },
    */
    anonymous: { type: Boolean, default: true },
    channels: { type: [], default: [] },
    sheets: { type: [], default: [] }
  });
  
  var normalizedPath = require("path").join(__dirname, "../auth");

  // inject auth strategys
  var strategys = require("fs").readdirSync(normalizedPath).map(function(file) {
    return require("../auth/" + file);
  });
  var authMethods = {};
  strategys.forEach(function (strategy) {
    authMethods[strategy.name] = strategy.dataSchema
  })
  userSchema.add({
    authMethods: authMethods
  });
  
  userSchema.statics.findOrCreate = function findOrCreate(query, cb) {
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    this.findOne(query, function (err, doc) {
      if (err) {
        deferred.reject(err)
        return;
      }
      if (!doc) {
        doc = new User(query);
      }
      //console.log(doc)
      deferred.resolve(doc);
    })
    return deferred.promise;
  }
  userSchema.methods.pSave = function (cb) {
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    this.save(function (err, doc, affected) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(doc);
    })
    return deferred.promise;
  }
  /*
  userSchema.methods.bindToFacebook = function bindToFacebook(token, cb) {
    var self = this;
    FB.setAccessToken(token);
    
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    
    FB.api('/me', function(response) {
      if(!response || response.error) {
        console.log(!response ? 'error occurred' : response.error);
        deferred.reject(!response ? 'error occurred' : response.error);
        return;
      }
      
      console.log('Successful login for: ' + response.name);
      console.log('Thanks for logging in, ' + response.name + '!');
      
      User.findOne({
        facebook: response.id
      }, function (err, doc) {
        if (err) {
          deferred.reject(err)
          return;
        }
        if (doc) {
          deferred.resolve(doc);
          return;
        }
        
        if (self.anonymous) {
          self.name = response.name
          self.anonymous = false;
        }
        self.facebook = response.id;
        self.save(function (err, doc) {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(doc)
          }
        });
        
      })
      
    });
    
    return deferred.promise;
  }
  
  userSchema.methods.registerWithEmail = function registerWithEmail(email, password, cb) {
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    var self = this;
    
    User.findOne({email: email}, function (err, doc) {
      if (err) {
        deferred.reject(err);
        return;
      }
      if (doc) {
        deferred.reject(new Error('already registered email'));
        return;
      }
      
      self.email = email;
      self.password = password;
      self.anonymous = false;
      
      self.save(function (err, doc) {
        if (err) {
          deferred.reject(err)
        } else {
          deferred.resolve(doc)
        }
      });
      
    })
    return deferred.promise;
  }
  */
  User = mongoose.model('User', userSchema);
  
  return User;
}

module.exports = singleton(UserModelFactory);