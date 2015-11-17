var singleton = require("../utils/singleton");
var Q = require('q');

var ChatChannelModelFactory = function (mongoose) {
  var Schema = mongoose.Schema;
  var chatChannelSchema, ChatChannel;
  var nooz = function () {}
  
  chatChannelSchema = new mongoose.Schema({
    name: { type: String, default: 'Chat' },
    users: [{type: Schema.Types.ObjectId, ref: 'Users' }],
    sheet: {type: Schema.Types.ObjectId, ref: 'Sheet' },
    setting: {}
  });
  
  
  ChatChannel = mongoose.model('ChatChannel', chatChannelSchema);
  
  return ChatChannel;
}

module.exports = singleton(ChatChannelModelFactory);