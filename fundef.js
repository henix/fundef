/**
 * fundef: Curry a lot of ES5 built-in functions for convenient functional programming in JS
 * Runtime Dependency: es5-shim
 */
var _;
(function(_) {

  /**
   * https://stackoverflow.com/questions/2735067/how-to-convert-a-dom-node-list-to-an-array-in-javascript
   * https://api.jquery.com/jquery.makearray/
   */
  _.makeArray = function(nodeList) {
    var len = nodeList.length;
    var ar = [];
    for (var i = 0; i < len; i++) {
      ar.push(nodeList[i]);
    }
    return ar;
  };

  var ops = {
    "not": function(a) { return !a },
    "lt": function(a, b) { return a < b },
    "gt": function(a, b) { return a > b }
  };

  _._op = ops;

  // Properties
  ["length"].forEach(function(name) {
    _[name] = function(a) { return a[name]; };
  });

  // Functions
  ["trim", "hasOwnProperty"].forEach(function(name) {
    _[name] = function() {
      var args = arguments;
      return function(obj) {
        return obj[name].apply(obj, args);
      };
    };
  });

  // ops
  ["not", "lt", "gt"].forEach(function(name) {
    _[name] = function(fn, rv) {
      return function(p) {
        return ops[name](fn(p), rv);
      };
    };
  });

  _.bind = function(obj, name) {
    return obj[name].bind(obj);
  };
})(_ || (_ = {}));
