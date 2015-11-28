/**
 * Set top position under the given element
 */
(function() {
  'use strict';
  var controller = function($element, $window) {
    $window.addEventListener("message", function(event) {
      if (event.data.height) {
        console.log("message received", event.data);
        $element[0].style.height = (event.data.height + 16) + 'px';
      }
    });
  };

  angular.module('jvDirectives').directive('jvIframeAutoHeight', function() {
    return {
      controller: controller
    };
  });
})();
