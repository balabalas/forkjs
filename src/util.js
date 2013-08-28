// util object
var Util = {};

Util.isBoolean = function(obj) {
  return typeof obj === 'boolean';
};

Util.isNull = function(obj) {
  return obj === null;
};

Util.isNumber = function(obj) {
  return typeof obj === 'number';
};

Util.isString = function(obj) {
  return typeof obj === 'string';
};

Util.isUndefined = function(obj) {
  return obj === void 0;
};

Util.isObject = function(obj) {
  return typeof obj === 'object' && obj !== null;
};

Util.isFunction = function(obj) {
  return typeof obj === 'function';
};
