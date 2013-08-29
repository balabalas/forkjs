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
