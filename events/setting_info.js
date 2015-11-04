function SettingInfo (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "setting_info";
}
SettingInfo.prototype.toString = function toString () {
  if (!this.message)
    return "Setting Info";
  return "Setting Info: " + this.message;
}

module.exports = SettingInfo