
var forkjs = {
  version: '#@VERSION'
};

function isType(type) {
  return function(obj){
    return {}.toString.call(obj) === '[object ' + type + ']';
  };
}

var isObject = isType('Object');
var isArray = Array.isArray || isType('Array');
var isString = isType('String');
var isFunction = isType('Function');

var doc = document;
var loc = location;
var data = {};
