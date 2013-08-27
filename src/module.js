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





