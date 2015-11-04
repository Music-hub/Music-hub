function SettingSuccess (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_success";
  
  this.type = "setting";
  this.level = "success";
}
SettingSuccess.prototype.toString = function toString () {
  if (!this.message)
    return "Setting Success";
  return "Setting Success: " + this.message;
}

module.exports = SettingSuccess