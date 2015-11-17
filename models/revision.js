var singleton = require("../utils/singleton");
var Q = require('q');

var RevisionModelFactory = function (mongoose) {
  var Schema = mongoose.Schema;
  var revisionSchema, Revision;
  var nooz = function () {}
  
  revisionSchema = new mongoose.Schema({
    sheet: {type: Schema.Types.ObjectId, ref: 'Sheet' },
    data: {},
    comment: {message: String, by: String}
  });
  
  
  revisionSchema.methods.pSave = function (cb) {
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
  
  revisionSchema.methods.clone = function (user, sheet) {
    return new Revision({
      sheet: sheet || this.sheet,
      data: this.data,
      comment: {message: "clone of revision " + this._id.toString(), by: user ? null : user.name}
    })
  }
  
  Revision = mongoose.model('Revision', revisionSchema);
  
  return Revision;
}

module.exports = singleton(RevisionModelFactory);