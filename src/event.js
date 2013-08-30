
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
