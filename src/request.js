var head = document.getElementsByTagName('head')[0] || document.documentElement;
var READY_STATE_REG = /^(?:loaded|complete|undefined)$/;

var currentlyAddingScript;
var interactiveScript;

function request(url, module) {
  var node = document.createElement('script');

  if(module.status < STATUS.LOADING) {
    module.status = STATUS.LOADING;
  }

  // init (require, exports, module) 
  window.module = module;
  window.exports = module.exports;
  window.require = module.require;

  // set **global** variable
  var global = clone(window);
  window.global = global;

  // append node status
  if(module.status < STATUS.LOADED) {
    addOnload(node, global, module);
  }

  module.status = STATUS.LOADED;

  node.async = true;
  node.src = url;

  currentlyAddingScript = node;

  head.appendChild(node);

  currentlyAddingScript = null;

  if(module.status < STATUS.EXECUTING) {
    setTimeout(wait, 100);
  }

  return module;
}

// invoke after node been loaded
function addOnload(node, callback, global, module) {

  // when node append to dom
  node.onload = node.onerror = node.onreadystatechange = function() {

    console.log('module.execute...');
    if(READY_STATE_REG.test(node.readyState)) {
      // remove handler
      node.onload = node.onerror = node.onreadystatechange = null;
      // set module.status to EXECUTING
      module.status = STATUS.EXECUTING;

      // remove node after loaded
      head.removeChild(node);

      node = null;

      // save module status here.
      module.save();

      resumeWindow(global);
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
