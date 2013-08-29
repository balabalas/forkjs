
var forkjs = {
  version: '#@VERSION'
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

