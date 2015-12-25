/**
 * all-examples section
 */
/*global document, prettyPrint */
(function() {
  'use strict';
 
  var baseUrl= 'https://rawgit.com/allenhwkim/angularjs-google-maps/master';
  
  var replaces = {
    '<script src="script-tags-for-development.js"></script>' :
       [
         '<script src="https://maps.google.com/maps/api/js?libraries=placeses,visualization,drawing,geometry,places"></script>',
         '<script src="https://code.angularjs.org/1.3.15/angular.js"></script>',
         '<script src="' + baseUrl + '/build/scripts/ng-map.js"></script>',
       ].join("\n"),
    '<script src="taxi-data.js"></script>':
      '<script src="'+baseUrl+'/testapp/taxi-data.js"></script>',
    '<script src="scripts/markerclusterer.js"></script>':
      '<script src="'+baseUrl+'/testapp/scripts/markerclusterer.js"></script>',
    '<script src="USGSOverlay.js"></script>':
      '<script src="'+baseUrl+'/testapp/USGSOverlay.js"></script>'
  };

  var reloadFacebookComments = function() {
    setTimeout(function() {
    var fbDiv = document.querySelector("#facebook-section");
    var fbCommentsDiv = document.querySelector("#facebook-section .fb-comments");
    fbDiv.removeChild(fbCommentsDiv);
    fbDiv.appendChild(fbCommentsDiv);
    FB.XFBML.parse();
    }, 100);
  }

  var controller = function($http, $timeout, $location, $element, jvPlunker, jvArrayFilter) {
    var vm = this;

    vm.viewIframe = function(url) {
      vm.absUrl = $location.absUrl();
      vm.viewSource = false;
      document.querySelector('iframe').
        setAttribute('src',  baseUrl + "/testapp/" + url.replace(/^!/,''));
      vm.viewIframeSource();
      reloadFacebookComments();
    };

    vm.viewIframeSource = function() {
      console.log('src', document.querySelector('iframe').getAttribute('src'));
      var url = document.querySelector('iframe').src;
      $http.get(baseUrl + '/testapp/' + url).then(function(resp) {
        var html = resp.data.replace(/</g, '&lt;');
        document.querySelector('pre.prettyprint').innerHTML = html;
        $timeout(function() {
          var el = document.querySelector('pre.prettyprint');
          el.className = el.className.replace(' prettyprinted', '');
          prettyPrint();
        });
      });
    };

    vm.viewInPlunker = function() {
      var url = document.querySelector('iframe').src;
      $http.get(baseUrl + '/testapp/' + url).then(function(resp) {
        var plunkerHTML = resp.data;
        for(var key in replaces) {
          var re = new RegExp(key.replace(/&lt;/g, '<'), 'g');
          plunkerHTML = plunkerHTML.replace(re,
            replaces[key].replace(/&lt;/g, '<'));
        }
        jvPlunker.submitToPlunker(plunkerHTML);
      });
    };

    $http.get(baseUrl + '/testapp/all-examples.json').then(function(resp) {
      vm.allExamples = jvArrayFilter(resp.data);
    });

    //initial iframe setting
    $timeout(function() {
      var iframeUrl = $location.url() ?
        $location.url().slice(1) : "map-simple.html";
      vm.viewIframe(iframeUrl);
    });

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
    };
  };

  angular.module('myapp').directive('allExamples', allExamples);

})();
