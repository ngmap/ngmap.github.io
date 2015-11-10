/**
 * {a:1, b:2}  // [{key:a, a:1}, {key:b, b:2}]
 */
(function() {
  var toArray = function(obj) {
    var arr = [];
    if (obj.constructor == Object) { // Hash
      for (var key in obj) {
        obj[key].key = key;
        arr.push(obj[key]);
      }
    }
    return arr;
  };

  angular.module('jvDirectives').filter('jvArray', function() {
    return toArray;
  });
})();

