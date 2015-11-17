function SheetInfo (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_success";
  
  this.type = "sheet";
  this.level = "info";
}
SheetInfo.prototype.toString = function toString () {
  if (!this.message)
    return "Sheet info";
  return "Sheet info: " + this.message;
}

module.exports = SheetInfo