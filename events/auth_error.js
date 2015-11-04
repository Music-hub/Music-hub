function AuthError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "auth_error";
  
  this.type = "auth";
  this.level = "error";
}
AuthError.prototype.toString = function toString () {
  if (!this.message)
    return "Auth error";
  return "Auth error (" + this.method + ") due to: " + this.message;
}

module.exports = AuthError