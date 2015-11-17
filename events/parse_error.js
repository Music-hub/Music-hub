function ParseError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  
  //this.type = "register_error";
  this.type = "parse";
  this.level = "error";
  
}
ParseError.prototype.toString = function toString () {
  if (!this.message)
    return "Failed to parse request";
  return "Failed to parse request due to: " + this.message;
}

module.exports = ParseError;