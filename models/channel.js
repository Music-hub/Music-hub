var singleton = require("../utils/singleton.js")
var Q = require('q');

var ChannelModelFactory = function (mongoose) {
  var channelSchema, Channel;
  var nooz = function () {}
  
  channelSchema = new mongoose.Schema({
    name: String, 
    users: [{}],
    sheets: {},
    logs: [{}]
  });
  channelSchema.statics.findOrCreate = function findOrCreate(channel, doc, cb) {
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    Channel.findById(channel, function (err, channel) {
      if (err) {
        deferred.reject(err);
      } else if (!doc) {
        channel = new Channel(doc);
        channel.save(deferred.makeNodeResolver())
      } else {
        deferred.resolve(channel);
      }
    });
    return deferred.promise;
  }
  channelSchema.methods.addUser = function addUser(user, cb) {
    var index, error;
    var deferred = Q.defer();
    deferred.promise.nodeify(cb);
    
    index = this.users.indexOf(user);
    
    if (index >= 0) {
      error = new Error('already added user ' + user + ' to channel ' + this._id);
      console.error(error);
      deferred.reject(error);
      return deferred.promise;
    }
    
    this.users.push(user);
    this.save(deferred.makeNodeResolver());
    
    return deferred.promise;
  }
  
  Channel = mongoose.model('Channel', channelSchema);
  
  return Channel;
}

module.exports = singleton(ChannelModelFactory);