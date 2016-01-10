var singleton = require("../utils/singleton");
var Q = require('q');

var SheetModelFactory = function (mongoose) {
  var Schema = mongoose.Schema;
  var sheetSchema, Sheet;
  var nooz = function () {}
  
  sheetSchema = new mongoose.Schema({
    forkedFrom: {},
    description: { type: String, default: '' },
    shortLink: { type: String, default: '' },
    name: { type: String, default: 'A New Sheet' },
    owners: [{type: Schema.Types.ObjectId, ref: 'User' }],
    collaborators: [{type: Schema.Types.ObjectId, ref: 'User' }],
    chatChannel: {type: Schema.Types.ObjectId, ref: 'ChatChannel' },
    revisions: [{type: Schema.Types.ObjectId, ref: 'Revision' }],
    setting: {}
  });
  
  sheetSchema.methods.pSave = function (cb) {
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
  
  Sheet = mongoose.model('Sheet', sheetSchema);
  
  return Sheet;
}

module.exports = singleton(SheetModelFactory);