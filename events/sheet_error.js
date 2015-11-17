function SheetError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_success";
  
  this.type = "sheet";
  this.level = "error";
}
SheetError.prototype.toString = function toString () {
  if (!this.message)
    return "Sheet error";
  return "Sheet error: " + this.message;
}

module.exports = SheetError