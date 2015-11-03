function RegisterInfo (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "register_info";
}
RegisterInfo.prototype.toString = function toString () {
  return "Registering via " + this.method + ": " + this.message;
}

module.exports = RegisterInfo;