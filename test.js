var assert;

if (typeof require !== 'undefined') {
  assert = require('assert');
  _ = require('./fundef.js');
} else {
  assert = QUnit.assert;
}

if (typeof test === 'undefined') {
  test = function(str, func) {
    console.log("run: " + str);
    func();
  };
}

test("1-ary functions", function() {
  assert.deepEqual(["x", "xx", "xxx"].map(_.$length), [1,2,3], "length");
  assert.deepEqual(["x", "xx", "xxx"].map(_.$length.gt(1).not()), [true, false, false]);
});

test("2-ary functions", function() {
  assert.equal([1,2,3,4].reduce(_.add(_), 0), 10, "add");
  assert.equal([1,2,3,4].reduce(_.mul(_), 1), 24, "mul");
});

test("bind / partial", function() {
  var dict = { a: 1, b: 2 };
  assert.deepEqual(["a", "b", "c"].filter(_(dict, 'hasOwnProperty', _).not()), ["c"], "filter keys that is not in a dict");
});
