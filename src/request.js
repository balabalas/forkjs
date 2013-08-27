var head = document.getElementsByTagName('head')[0] || document.documentElement;
var READY_STATE_REG = /^(?:loaded|complete|undefined)$/;

var currentlyAddingScript;
var interactiveScript;

function request(url, callback, charset) {
  var node = document.createElement('script');

  addOnload(node, callback);

  node.async = true;
  node.src = url;

  currentlyAddingScript = node;

  head.appendChild(node);

  currentlyAddingScript = null;
}

function addOnload(node, callback) {

  node.onload = node.onerror = function() {

    if(READY_STATE_REG.test(node.readyState)) {
      // remove handler
      node.onload = node.onerror = null;

      // remove node after loaded
      head.removeChild(node);

      node = null;
      callback();
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
