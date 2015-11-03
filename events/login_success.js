function LoginSuccess (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "login_success";
}
LoginSuccess.prototype.toString = function toString () {
  if (!this.message)
    return "Successfully login via " + this.method;
  return "Successfully login via " + this.method + ": " + this.message;
}

module.exports = LoginSuccess;