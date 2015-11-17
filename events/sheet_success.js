function SheetSuccess (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "setting_success";
  
  this.type = "sheet";
  this.level = "success";
}
SheetSuccess.prototype.toString = function toString () {
  if (!this.message)
    return "Sheet update success";
  return "Sheet update success: " + this.message;
}

module.exports = SheetSuccess