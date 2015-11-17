function RevisionInfo (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_error";
  
  this.type = "revision";
  this.level = "info";
}
RevisionInfo.prototype.toString = function toString () {
  if (!this.message)
    return "Revision Info";
  return "Revision Info: " + this.message;
}

module.exports = RevisionInfo