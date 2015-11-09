/**
 * all-examples section
 */
(function() {
  'use strict';
 
  var baseUrl= 'http://rawgit.com/allenhwkim/angularjs-google-maps/angualr2-prepared/testapp';
  var replaces = {
    '<script src="script-tags-for-development.js"></script>' :
       [
         '<script src="http://maps.google.com/maps/api/js?libraries=placeses,visualization,drawing,geometry,places"></script>',
         '<script src="http://code.angularjs.org/1.3.15/angular.js"></script>',
         '<script src="http://rawgit.com/allenhwkim/angularjs-google-maps/angualr2-prepared/build/scripts/ng-map.js"></script>',
       ].join("\n"),
    '<script src="taxi-data.js"></script>':
      '<script src="'+baseUrl+'/taxi-data.js"></script>',
    '<script src="scripts/markerclusterer.js"></script>':
      '<script src="'+baseUrl+'/scripts/markerclusterer.js"></script>',
    '<script src="USGSOverlay.js"></script>':
      '<script src="'+baseUrl+'/USGSOverlay.js"></script>'
  };

  var controller = function($http, $timeout, $location, $element, jvPlunker, jvArrayFilter) {
    var vm = this;

    vm.viewIframe = function(url) {
      vm.viewSource = false;
      document.querySelector('iframe').
        setAttribute('src',  baseUrl + "/" + url);
    };

    vm.viewIframeSource = function() {
      console.log('src', document.querySelector('iframe').getAttribute('src'));
      var url = document.querySelector('iframe').src;
      $http.get(baseUrl + '/' + url).then(function(resp) {
        vm.iframeSource = resp.data;
        vm.viewSource = true;
        $timeout(function() {
          prettyPrint();
        });
      })
    };

    vm.viewInPlunker = function() {
      var url = document.querySelector('iframe').src;
      $http.get(baseUrl + '/' + url).then(function(resp) {
        var plunkerHTML = resp.data;
        for(var key in replaces) {
          var re = new RegExp(key.replace(/&lt;/g, '<'), 'g');
          plunkerHTML = plunkerHTML.replace(re,
            replaces[key].replace(/&lt;/g, '<'));
        }
        jvPlunker.submitToPlunker(plunkerHTML);
      })
    };

    $http.get(baseUrl + '/all-examples.json').then(function(resp) {
      vm.allExamples = jvArrayFilter(resp.data);
    });

    //initial iframe setting
    if ($location.url()) {
      $timeout(function() {
        document.querySelector('iframe').
          setAttribute('src', baseUrl + "/" + $location.url().slice(1));
      });
    } else {
      $timeout(function() {
        document.querySelector('iframe').
          setAttribute('src', baseUrl + "/map-simple.html");
      });
    }
  };


  var allExamples = function() {
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
    }
  };

  angular.module('myapp').directive('allExamples', allExamples);

})();
 
