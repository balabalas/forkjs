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

