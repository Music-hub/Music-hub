function DatabaseError (method, data, message) {
  this.message = message;
  this.data = data;
  this.method = method;
  this.type = "database_error";
}
DatabaseError.prototype.toString = function toString () {
  if (!this.message)
    return "Database Error";
  return "Database Error: " + this.message;
}

module.exports = DatabaseError;