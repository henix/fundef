/**
 * fundef: Function combinators for ES5
 * Runtime Dependency: es5-shim
 */
var _, __;
(function(_) {

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

  /* Unary functions */

  _.identity = function(x) {
    return x;
  };

  var ops = {
    "not": function(a) { return !a },
    "eq": function(a, b) { return a == b },
    "ne": function(a, b) { return a != b },
    "lt": function(a, b) { return a < b },
    "gt": function(a, b) { return a > b }
  };

  // Properties
  var properties = [
    "length",
    "textContent", "children"
  ];
  properties.forEach(function(name) {
    _[name] = function(a) { return a[name]; };
  });

  // Functions
  [
    "hasOwnProperty",
    "trim",
    "getAttribute"
  ].forEach(function(name) {
    _[name] = function() {
      var args = arguments;
      return function(obj) {
        return obj[name].apply(obj, args);
      };
    };
  });

  // Array/Object index
  _._ = function(i) {
    return function(ar) {
      return ar[i];
    };
  };
  _.__ = function(ar) {
    return function(i) {
      return ar[i];
    };
  };

  _.isInstanceOf = function(f) {
    return function(o) {
      return o instanceof f;
    };
  };

  _.invoke = function(name) {
    var args = _.makeArray(arguments).slice(1);
    return function(obj) {
      return obj[name].apply(obj, args);
    };
  };

  // unary ops
  ["not"].forEach(function(name) {
    _[name] = function(fn) {
      return function(obj) {
        if (fn != null) {
          return ops[name](fn(obj));
        } else {
          return ops[name](obj);
        }
      };
    };
  });

  // binary ops
  ["eq", "ne", "lt", "gt"].forEach(function(name) {
    _[name] = function(f_v, rv) {
      return function(obj) {
        if (rv != null) {
          return ops[name](f_v(obj), rv);
        } else {
          return ops[name](obj, f_v);
        }
      };
    };
  });

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

  /* Chains */

  function ProxyFunc(prev, func) {
    this.prev = prev;
    this.func = func;

    if (func === _.textContent) {
      this.length = new ProxyFunc(this, _.length);
    } else if (func !== _.length && func !== _.children) {
      properties.forEach(function(name) {
        this[name] = new ProxyFunc(this, _[name]);
      }, this);
    }

    var this1 = this;
    this.$ = function(obj) {
      function _apply(p) {
        return p ? p.func(_apply(p.prev)) : obj;
      }
      return this1.func(_apply(this1.prev));
    };
  }
  Object.keys(_).filter(_.not(_.bind({'makeArray':1,'bind':1,'and':1,'or':1}, 'hasOwnProperty'))).forEach(function(name) {
    if (properties.indexOf(name) == -1) {
      ProxyFunc.prototype[name] = function() {
        return new ProxyFunc(this, _[name].apply(null, arguments));
      };
    }
  });

  __ = new ProxyFunc(null, _.identity);

})(_ || (_ = {}));
