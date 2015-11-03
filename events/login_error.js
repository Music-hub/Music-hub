function LoginError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "login_error";
}
LoginError.prototype.toString = function toString () {
  if (!this.message)
    return "Failed to Login via " + this.method;
  return "Failed to Login via " + this.method + " due to: " + this.message;
}

module.exports = LoginError;