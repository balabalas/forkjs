
var forkjs = {
  version: '#@VERSION'
};

var doc = document;
var loc = location;
var data = {};

// forkjs script should have an id **forkjs**
var xScript = document.getElementById('forkjs');
// get src for main script
var xSrc = xScript.src || xScript.getAttribute('src', 4);
// get dirname
var xDir = dirname(xSrc);

// get hostname
// http://www.example.com.cn/well/good.html  ==> http://www.example.com.cn/
var hostRegExp = /^.*\w+\.\w+\//;
var xHostName = xDir.match(hostRegExp)[0];


