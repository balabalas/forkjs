(function(window) {

  'use strict';


var forkjs = {
  version: '0.0.1'
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

function clone(obj){
  var ret = {};

  for(var prop in obj){
    ret[prop] = obj[prop];
  }

  return ret;
}

function global(){
  var ret = {};

  ret = clone(window);

  return ret;
}

function normalWindow(){
  var g = global;

  if(g) {
    for(var prop in window){
      if(!g[prop]) {
        delete window[prop];
      }
    }
  }
}


var events = data.events = {};

// add an event listener
// and same listener should just add once.
modulejs.on = function(name, callback){
  var list = events[name] || (events[name] = []);
  var CB_EXISTS = false;

  for(var i = 0, len = list.length; i < len; i++){
    if(list[i] === callback){
      CB_EXISTS = true;
    }
  }

  if(!CB_EXISTS) {
    list.push(callback);
  }

  return modulejs;
};

modulejs.addListener = modulejs.on;

// remove listener or all listeners for an event.
modulejs.off = function(name, callback){
  if(!name) {
    throw new Error('You should have a name when you remove a listener.');
  }

  var list = events[name];

  if(list) {
    if(callback) {
      for(var i = list.length; i >= 0; i--){
        if(list[i] === callback){
          list.splice(i, 1);
          break;
        }
      }
    }
    else {
      delete events[name];
    }
  }

  return module.js;
};

modulejs.removeListener = modulejs.off;

// remove all listeners
modulejs.removeAllListener = function(name){
  if(name) {
    delete events[name];
  }
  else {
    delete data.events;
    events = data.events = {};
  }
};

// emit event
modulejs.emit = function(name) {
  var list = events[name];
  var argv = arguments.slice(1);
  var fn;

  if(list) {
    list = list.slice();

    while((fn = list.shift())) {
      fn(argv);
    }
  }
};

  window.modulejs = modulejs;

})(window);
