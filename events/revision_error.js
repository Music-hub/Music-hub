function RevisionError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_error";
  
  this.type = "revision";
  this.level = "error";
}
RevisionError.prototype.toString = function toString () {
  if (!this.message)
    return "Revision Error";
  return "Revision Error: " + this.message;
}

module.exports = RevisionError