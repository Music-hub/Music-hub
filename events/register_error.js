function RegisterError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "register_error";
}
RegisterError.prototype.toString = function toString () {
  if (!this.message)
    return "Failed to Register via " + this.method;
  return "Failed to Register via " + this.method + " due to: " + this.message;
}

module.exports = RegisterError;