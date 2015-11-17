function RevisionSuccess (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_error";
  
  this.type = "revision";
  this.level = "success";
}
RevisionSuccess.prototype.toString = function toString () {
  if (!this.message)
    return "Revision Success";
  return "Revision Success: " + this.message;
}

module.exports = RevisionSuccess