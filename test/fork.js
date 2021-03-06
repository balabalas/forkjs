(function(window) {

  'use strict';


var forkjs = {
  version: '0.0.1'
};

var doc = document;
var loc = location;
var data = {};

// relative to page. work-directory
var pwd = data.pwd = dirname(loc.href);

// forkjs script should have an id **forkjs**
var xScript = document.getElementById('forkjs');

// get that main js such as:  data-main="./hello.js"
var MAIN_SCRIPT = xScript.getAttribute('data-main');

// get src for main script
var xSrc = xScript.src || xScript.getAttribute('src', 4);

// get dirname
var xDir = dirname(xSrc);

// relative to fork.js, current work-directory
var cwd = data.cwd = xDir;

// get hostname
// http://www.example.com.cn/well/good.html  ==> http://www.example.com.cn/
var hostRegExp = /^.*\w+\.\w+\//;
var xHostName = xDir.match(hostRegExp) ?
                xDir.match(hostRegExp)[0] :
                '';


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

// module status
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

// wait function to setTimeout
function wait(){
}

// object clone.
// used to clone *window* to *global*
function clone(obj){
  var ret = {};

  for(var prop in obj){
    ret[prop] = obj[prop];
  }

  return ret;
}

// reset window object status
function resumeWindow(global){
  var g = global;

  if(g) {
    // delete dirty vars.
    for(var prop in window){
      if(!g[prop]) {
        delete window[prop];
      }
      else {
        delete g[prop];
      }
    }

    // add global vars to **window**
    for(var p in g){
      window[p] = g[p];
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
var emit = forkjs.emit = function(name) {
  var list = events[name];
  var argv = Array.prototype.slice.call(arguments,1);
  var fn;

  if(list) {
    list = list.slice();

    while((fn = list.shift())) {
      fn(argv);
    }
  }
};

function isURL(path){
  var netURL = path.substring(0, 6) === 'http://';
  var fileURL = path.substring(0, 6) === 'file://';

  return netURL || fileURL;
}

function isAbsolute(path) {
  return path.charAt(0) === '/';
}

var DOUBLE_DOT_REG = /\/[^/]+\/\.\.\//;

// dirname('a/b/c/d.js') ==> 'a/b/c/'
function dirname(path){
  var DIRNAME_REG = /[^?#]*\//;
  return path.match(DIRNAME_REG)[0];
}

// make sure appendix
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
    ret = dirname(refUri) + id;
    while(ret.match(DOUBLE_DOT_REG)) {
      ret = ret.replace(DOUBLE_DOT_REG, '/');
    }
  }
  else if(option === 'a') {
    ret = refUri ? dirname(refUri) + id :
                   xHostName + id;
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

  if(isURL(id)) {
    return id;
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
var checkScriptLoadState;

function request(url, module) {
  var node = document.createElement('script');

  if(module.status < STATUS.LOADING) {
    module.status = STATUS.LOADING;
  }

  // init (require, exports, module) 
  window.module = module;
  window.exports = module.exports;
  window.require = module.require;

  // set **global** variable
  var global = clone(window);
  window.global = global;

  checkScriptLoadState = setInterval(function(){
    addOnload(node, global, module);
  }, 10);
  // append node status
  if(module.status < STATUS.LOADED) {
    addOnload(node, global, module);
  }

  module.status = STATUS.LOADED;

  node.async = true;
  node.src = url;

  currentlyAddingScript = node;

  head.appendChild(node);

  currentlyAddingScript = null;

//  if(module.status < STATUS.EXECUTING) {
//    setTimeout(wait, 100);
//  }

  return module;
}

// invoke after node been loaded
function addOnload(node, global, module) {

  // when node append to dom
  node.onload = node.onerror = node.onreadystatechange = function() {

    console.log('module.execute...' + (new Date()).getTime());
    clearInterval(checkScriptLoadState);
    if(READY_STATE_REG.test(node.readyState)) {
      // remove handler
      node.onload = node.onerror = node.onreadystatechange = null;
      // set module.status to EXECUTING
      module.status = STATUS.EXECUTING;

      // remove node after loaded
      head.removeChild(node);

      node = null;

      // save module status here.
      // module.save();

      resumeWindow(global);
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

// module constructor
function Module(uri){
  this.uri = uri;
  this.exports = {};
  this.status = 0;
}

// resolve id to uri
Module.resolve = function(id, refUri) {
  var emitData = {id: id, refUri: refUri};
  emit('resolve', emitData);

  var surl = emitData.uri || resolveId(id, refUri);
  // return the real uri for module.
  return surl;
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

  mod.status = mod.status < STATUS.FETCHING ? (mod.status) : STATUS.FETCHING;

  fetchingList[uri] = true;
  callbackList[uri] = [mod];

  if(mod.status < STATUS.LOADING) {
    mod.status = STATUS.LOADING;
    sendRequest();
  }

  function sendRequest(){
    request(uri,  mod);
  }
};

// get a module by uri
Module.get = function(uri) {
  uri = Module.resolve(uri);
  var mod = cachedMods[uri] || (cachedMods[uri] = new Module(uri));

  if(mod.status >= STATUS.EXECUTING) {
    return mod;
  }

  mod.status = STATUS.FETCHING;

  mod.fetch();

  return mod;
};

// execute a module then get its exports
Module.prototype.exec = function() {
  var mod = this;
  var ret;

  while(mod.status < STATUS.EXECUTING) {
    setTimeout(wait, 0);
  }

 if(mod.status >= STATUS.EXECUTING) {
    ret = mod.exports;
  }

  if(checkScriptLoadState) {
    clearInterval(checkScriptLoadState);
    checkScriptLoadState = null;
  }
  // execute just return that exports.
  return ret;
};

Module.prototype.require = function(id){
  var mod = this;
  var refUri = mod.uri || forkjs.cwd;
  return Module.get(Module.resolve(id, refUri)).exec();
};

// this is just for test. should delete after test
function executeMain(){
  console.log(MAIN_SCRIPT);
  Module.get(MAIN_SCRIPT);
}
window.hand = executeMain;



window.forkjs = forkjs;
//executeMain();

})(window);
