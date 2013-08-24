
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


