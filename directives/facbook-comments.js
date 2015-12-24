/**
 * facebook-comments section
 */
(function() {
  'use strict';
 
  var controller = function($location) {
    var vm = this;
    vm.absUrl = $location.absUrl();
  };

  var facebookComments = function() {
    return {
      restrict: 'E',
      scope: {},
      controller: controller,
      controllerAs: 'vm',
      transclude: true,
      link: function(scope, element, a, c, transclude) {
        transclude(scope, function(clone) {
          element.append(clone);
        });
      }
    };
  };

  angular.module('myapp').
    directive('facebookComments', facebookComments);

})();
