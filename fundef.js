/**
 * fundef: Function combinators for ES5
 * Runtime Dependency: es5-shim
 * License: MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    var name;
    if (document) {
      var script = document.currentScript;
      if (!script) {
        var scripts = document.getElementsByTagName("script");
        if (scripts.length) {
          script = scripts[scripts.length-1];
        }
      }
      if (script) {
        name = script.getAttribute("name");
      }
    }
    if (!name) {
      name = "_";
    }
    root[name] = factory();
  }
}(this, function() {

  var _ = function(this_f, name) {
    var obj = null;
    var argt = _.makeArray(arguments);
    var f;
    if (typeof this_f === 'function') {
      f = this_f;
      argt = argt.slice(1);
    } else if (typeof name === 'string') {
      obj = this_f;
      f = obj[name];
      argt = argt.slice(2);
    } else {
      throw new SyntaxError("arg1 must be function, or arg2 must be string");
    }
    return $newProp(null, function(stack) {
      var args = $fillargs(argt, stack);
      stack.push(f.apply(obj, args));
    });
  };

  /* Utils */

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

  _.bind = function(obj, name) {
    var args = _.makeArray(arguments).slice(2);
    return obj[name].bind.apply(obj[name], [obj].concat(args));
  };

  _.identity = function(x) {
    return x;
  };

  _.and = function() {
    var args = arguments;
    return function(x) {
      var len = args.length;
      for (var i = 0; i < len; i++) {
        if (!args[i](x)) {
          return false;
        }
      }
      return true;
    };
  };
  _.or = function() {
    var args = arguments;
    return function(x) {
      var len = args.length;
      for (var i = 0; i < len; i++) {
        if (args[i](x)) {
          return true;
        }
      }
      return false;
    };
  };

  /* Basic functions */

  var ops = {
    "not": function(a) { return !a; },
    "eq": function(a, b) { return a == b; },
    "ne": function(a, b) { return a != b; },
    "lt": function(a, b) { return a < b; },
    "gt": function(a, b) { return a > b; },

    "add": function(a, b) { return a + b; },
    "sub": function(a, b) { return a - b; },
    "mul": function(a, b) { return a * b; },
    "div": function(a, b) { return a / b; },

    "_": function(o, n) { return o[n]; },
    "isInstanceOf": function(o, f) { return o instanceof f; }
  };

  function $evaluate(funcObj, stack) {
    if (funcObj.prev) {
      $evaluate(funcObj.prev, stack);
    }
    funcObj.func(stack);
  }

  function $fillargs(args, stack) {
    return args.map(function(v) {
      return v === _ ? stack.pop() : v;
    });
  }

  var __ = {};

  function unspecialize(name) {
    return name.charAt(0) == "$" ? name.substring(1) : name;
  }

  // Properties
  var properties = [
    "$length",
    "textContent", "children"
  ];
  properties.forEach(function(name) {
    __[name] = function(stack) {
      var obj = stack.pop();
      stack.push(obj[unspecialize(name)]);
    };
  });

  // Functions
  [
    "hasOwnProperty",
    "trim",
    "reduce",
    "getAttribute"
  ].forEach(function(name) {
    __[name] = function() {
      var argt = _.makeArray(arguments);
      return function(stack) {
        var obj = stack.pop();
        var args = $fillargs(argt, stack);
        stack.push(obj[name].apply(obj, args));
      };
    };
  });

  // ops
  [
    "not", "eq", "ne", "lt", "gt",
    "add", "sub", "mul", "div",
    "_", "isInstanceOf"
  ].forEach(function(name) {
    __[name] = function(rvt) {
      return function(stack) {
        var obj = stack.pop();
        var rv = rvt === _ ? stack.pop() : rvt;
        stack.push(ops[name](obj, rv));
      };
    };
  });

  // swapped ops
  ["_", "isInstanceOf"].forEach(function(name) {
    __[name + "$"] = function(objt) {
      return function(stack) {
        var rv = stack.pop();
        var obj = objt === _ ? stack.pop() : objt;
        stack.push(ops[name](obj, rv));
      };
    };
  });

  __.invoke = function(name) {
    var argt = _.makeArray(arguments);
    return function(stack) {
      var obj = stack.pop();
      var args = $fillargs(argt, stack);
      stack.push(obj[args[0]].apply(obj, args.slice(1)));
    };
  };

  function $newFinal() {
    var ret = function() {
      var stack = _.makeArray(arguments).reverse();
      $evaluate(ret, stack);
      return stack.pop();
    };
    return ret;
  }

  function $newProp(prev, func) {
    var ret = $newFinal();
    ret.prev = prev;
    ret.func = func;
    $define(ret);
    return ret;
  }

  function $define(funcObj) {

    Object.keys(__).forEach(function(name) {
      if (properties.indexOf(name) == -1) {
        funcObj[name] = function() {
          var ret = $newFinal();
          ret.prev = this;
          ret.func = __[name].apply(null, arguments);
          $define(ret);
          return ret;
        };
      }
    });

    if (funcObj.func === __.textContent || funcObj.func === __.children) {
      funcObj.$length = $newProp(funcObj, __.$length);
    } else if (funcObj.func !== __.$length) {
      properties.forEach(function(name) {
        funcObj[name] = $newProp(funcObj, __[name]);
      });
    }
  }

  _.func = function(){};
  $define(_);

  return _;

}));
