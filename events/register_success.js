function RegisterSuccess (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  //this.type = "register_success";
  
  this.type = "register";
  this.level = "success";
}
RegisterSuccess.prototype.toString = function toString () {
  if (!this.message)
    return "Successfully Register via " + this.method;
  return "Successfully to Register via " + this.method + " due to: " + this.message;
}

module.exports = RegisterSuccess;