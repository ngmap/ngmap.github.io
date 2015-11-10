/**
 * Set top position under the given element
 */
(function() {
  'use strict';
  var controller = function($scope, $element, $window, $document) {
    var fixedUnder = $document[0].querySelector($scope.underElement);
    if (!fixedUnder) {
      throw "ngd-fixed-under, no element found by value";
    };


    angular.element($window).bind('scroll', function() {
      var rect = fixedUnder.getBoundingClientRect();
      if (parseFloat(rect.bottom)<0) {
        $element.css({position:'fixed', top: 0});
      } else {
        $element.css({position:'absolute', top: null});
      }
    });
  };

  angular.module('jvDirectives').directive('jvFixedUnder', function() {
    return {
      controller: controller,
      scope: { underElement: '@' }
    };
  });
})();
