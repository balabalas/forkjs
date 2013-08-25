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
}

// add base uri to id.
function addBase(id, refUri) {

  if(isAbsolute(path)) {
    return id;
  }

  var firstByte = id.charAt(0);
  var firstChar = firstByte + id.charAt(1);
  var ret;

  if(firstByte === '.') {
    if(firstChar === './') {
    }
    else if(firstChar === '..') {
    }
  }
  else if(firstByte === '/') {
  }
  else {
  }

  return ret;
}

// refUri: http://hello.com/a/b
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

