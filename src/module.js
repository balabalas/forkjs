var cachedMods = forkjs.cache = {};
var anonymouseMeta;

var fetchingList = {};
var fetchedList = {};
var callbackList = {};

// module constructor
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

  mod.status = mod.status < STATUS.FETCHING ? (mod.status) : STATUS.FETCHING;

  fetchingList[uri] = true;
  callbackList[uri] = [mod];

  if(mod.status < STATUS.LOADING) {
    mod.status = STATUS.LOADING;
    sendRequest();
  }

  function sendRequest(){
    request(requestUri,  mod);
  }
};

// get a module by uri
Module.get = function(uri) {
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
  // execute just return that exports.
  return ret;
};

Module.prototype.require = function(id){
  var mod = this;
  var refUri = mod.uri || forkjs.cwd;
  return Module.get(Module.resolve(id, refUri)).exec();
};

