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
forkjs.on = function(name, callback){
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

  return forkjs;
};

forkjs.addListener = forkjs.on;

// remove listener or all listeners for an event.
forkjs.off = function(name, callback){
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

forkjs.removeListener = forkjs.off;

// remove all listeners
forkjs.removeAllListener = function(name){
  if(name) {
    delete events[name];
  }
  else {
    delete data.events;
    events = data.events = {};
  }
};

// emit event
forkjs.emit = function(name) {
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

function isAbsolute(path){
  var netAbsolute = path.substring(0, 6) === 'http://';
  var fileAbsolute = path.substring(0, 6) === 'file://';

  return netAbsolute || fileAbsolute;
}

var DIRNAME_REG = /[^?#]*\//;

// dirname('a/b/c/d.js') ==> 'a/b/c'
function dirname(path){
  return path.match(DIRNAME_REG)[0];
}

var cwd = data.cwd = dirname(loc.href);

function normalize(id) {
  var append = id.slice(-3);
  if(append !== '.js') {
    id += '.js';
  }
  return id;
}

// join refUri and id
function join(id, refUri, option) {
  var ret;
  if(!option) {
    ret = refUri + id;
  }
  else if(option === 'r') {
  }
  else if(option === 'a') {
  }

  return ret;
}

// add base uri to id.
function addBase(id, refUri) {

  if(isAbsolute(id)) {
    return id;
  }

  var firstByte = id.charAt(0);
  var firstChar = firstByte + id.charAt(1);
  var ret;

  if(firstByte === '.') {
    if(firstChar === './') {
      ret = refUri + id.substring(2);
    }
    else if(firstChar === '..') {
      // join relative path
      ret = join(id, refUri, 'r');
    }
  }
  else if(firstByte === '/') {
    // join absolute path
    ret = join(id, refUri, 'a');
  }
  else {
  }

  return ret;
}

// refUri: http://hello.com/a/b/
// ./good.js      ==> http://hello.com/a/b/good.js
// ../dir/best.js ==> http://hello.com/a/dir/best.js
// /better.js     ==> http://hello.com/better.js
// well           ==> http://hello.com/a/b/well.js
function resolveId(id, refUri) {

  if(!id) {
    throw new Error('You should require something.');
  }

  if(!refUri) {
    refUri = cwd;
  }

  id = normalize(id);

  return addBase(id, refUri);
}


var head = document.getElementsByTagName('head')[0] || document.documentElement;
var READY_STATE_REG = /^(?:loaded|complete|undefined)$/;

var currentlyAddingScript;
var interactiveScript;

function request(url, callback, charset) {
  var node = document.createElement('script');

  addOnload(node, callback);

  node.async = true;
  node.src = url;

  currentlyAddingScript = node;

  head.appendChild(node);

  currentlyAddingScript = null;
}

function addOnload(node, callback) {

  node.onload = node.onerror = function() {

    if(READY_STATE_REG.test(node.readyState)) {
      // remove handler
      node.onload = node.onerror = null;

      // remove node after loaded
      head.removeChild(node);

      node = null;
      callback();
    }
  };
}

function getCurrentScript(){
  if(currentlyAddingScript) {
    return currentlyAddingScript;
  }

  if(interactiveScript && interactive.readyState === 'interactive') {
    return interactiveScript;
  }

  var scripts = document.getElementsByTagName('script');

  for(var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i];
    if(script.readyState === 'interactive') {
      interactiveScript = script;
      return interactiveScript;
    }
  }
}

var cachedMods = forkjs.cache = {};
var anonymouseMeta;

var fetchingList = {};
var fetchedList = {};
var callbackList = {};

var STATUS = Module.STATUS = {
  // 1. The `module.uri` is being fetched
  FETCHING: 1,
  // 2. The meta data has been saved to cachedMods
  SAVED: 2,
  // 3. The `module.dependencies` are being loaded
  LOADING: 3,
  // 4. The module has already loaded.
  LOADED: 4,
  // 5. The module is being executed.
  EXECUTING: 5,
  // 6. The `module.exports` is available.
  EXECUTED: 6
};

function Module(uri){
  this.uri = uri;
  this.exports = null;
  this.status = 0;
}

// resolve id to uri
Module.resolve = function(id, refUri) {
  var emitData = {id: id, refUri: refUri};
  emit('resolve', emitData);

  // return the real uri for module.
  return emitData.uri || id2uri(id, refUri);
};

Module.prototype.resolve = function(){
  var mod = this;
  var ids = mod.dependencies;
  var uris = [];

  for(var i = 0, len = ids.length; i < len; i++) {
    uris[i] = Module.resolve(ids[i], mod.uri);
  }

  return uris;
};

Module.prototype.load = function(){
  var mod = this;

  // not load a module again
  if(mod.status >= STATUS.LOADING) {
    return;
  }

  mod.status = STATUS.LOADING;

  var uris = mod.resolve();

};

// when module is loaded.
Module.prototype.onload = function(){
  var mod = this;
  mod.status = STATUS.LOADED;

  if(mod.callback) {
    mod.callback();
  }

  var waitings = mod.waitings;
  var uri, m;

  for(uri in waitings) {
    if(waitings.hasOwnProperty(uri)) {
      m = cachedMods[uri];
      m.remain -= waitings[uri];
      if(m.remain === 0) {
        m.onload();
      }
    }
  }

  delete mod.waitings;
  delete mod.remain;
};

// fetch a module
Module.prototype.fetch = function(requestCache){
  var mod = this;
  var uri = mod.uri;

  mod.status = STATUS.FETCHING;

  var emitData = { uri: uri };
  emit('fetch', emitData);

  var requestUri = emitData.requestUri || uri;

  if(fetchingList[requestUri]) {
    callbackList[requestUri].push(mod);
    return;
  }

  fetchingList[requestUri] = true;
  callbackList[requestUri] = [mod];

  emit('request', emitData = {
    uri: uri,
    requestUri: requestUri,
    onRequest: onRequest,
    charset: data.charset
  });

  if(!emitData.requested) {
    var _notRequested = requestCache ? 
        requestCache[emitData.requestUri] = sendRequest : 
        sendRequest();
  }

  function sendRequest(){
    request(emitData.requestUri, emitData.onRequest, emitData.charset);
  }

  function onRequest() {
    delete fetchingList[requestUri];
    fetchedList[requestUri] = true;

    if(anonymousMeta) {
      Module.save(uri, anonymousMeta);
      anonymousMeta = null;
    }

    var m, mods = callbackList[requestUri];

    delete callbackList[requestUri];
    while ((m = mods.shift())) {
      m.load();
    }
  }
};

// get a module by uri
Module.get = function(uri) {
  var mod = cachedMods[uri] || (cachedMods[uri] = new Module(uri));

  if(mod.status >= STATUS.EXECUTING) {
    return mod;
  }

  mod.status = STATUS.EXECUTING;

  mod.fetch();

  return mod;
};

// execute a module then get its exports
Module.prototype.exec = function() {
  var mod = this;

  // execute just return that exports.
  return mod.exports;
};

function require(id){
  return Moduel.get(Module.resolve(id, forkjs.cwd)).exec();
}






window.forkjs = forkjs;
window.require = require;

})(window);
