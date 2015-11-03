function SettingError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "setting_error";
}
SettingError.prototype.toString = function toString () {
  if (!this.message)
    return "Setting Error";
  return "Setting Error: " + this.message;
}

module.exports = SettingError