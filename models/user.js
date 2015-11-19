var singleton = require("../utils/singleton");
var Q = require('q');
//var FB = require('fb');

var UserModelFactory = function (mongoose) {
  
  var userSchema, User;
  var nooz = function () {}
  
  userSchema = new mongoose.Schema({
    name: { type: String, default: 'Anonymous' },
    
    //email: { type: String, default: '' },
    //password: { type: String, default: '' },
    //facebook: { type: String, default: '' },
    
    anonymous: { type: Boolean, default: true },
    //channels: { type: [], default: [] },
    sheets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sheet' }],
    setting: {}
  });
  
  var normalizedPath = require("path").join(__dirname, "../auth");

  // inject auth strategys
  var strategys = require("fs").readdirSync(normalizedPath).map(function(file) {
    return require("../auth/" + file);
  });
  var authMethods = {};
  strategys.forEach(function (strategy) {
    authMethods[strategy.name] = strategy.dataSchema
    if (strategy.methods) {
      for (var i in strategy.methods) {
        userSchema.methods[i] = strategy.methods[i];
      }
    }
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
  
  
  userSchema.methods.toClientObject = function toClientObject() {
    var obj = this.toObject();
    delete obj.authMethods;
    return obj;
  }
  
  User = mongoose.model('User', userSchema);
  
  return User;
}

module.exports = singleton(UserModelFactory);