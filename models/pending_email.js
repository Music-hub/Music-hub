var singleton = require("../utils/singleton");
var Q = require('q');

var UUID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var PendingEmailModelFactory = function (mongoose) {
  
  var pendingEmailSchema, PendingEmail;
  var nooz = function () {}
  
  pendingEmailSchema = new mongoose.Schema({
    email: String,
    token: { type: String, default: UUID},
  });
  
  pendingEmailSchema.statics.findOrCreate = function findOrCreate(query, cb) {
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    this.findOne(query, function (err, doc) {
      if (err) {
        deferred.reject(err)
        return;
      }
      if (!doc) {
        doc = new PendingEmail(query);
      }
      //console.log(doc)
      deferred.resolve(doc);
    })
    return deferred.promise;
  };
  
  pendingEmailSchema.methods.refreshToken = function (cb) {
    this.token = UUID();
    
  }
  pendingEmailSchema.methods.pSave = function (cb) {
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    this.save(function (err, doc, affected) {
      if (err) {
        deferred.reject(err);
      }
      deferred.resolve(doc);
    })
    return deferred.promise;
  };
  
  PendingEmail = mongoose.model('PendingEmail', pendingEmailSchema);
  
  return PendingEmail;
}

module.exports = singleton(PendingEmailModelFactory);