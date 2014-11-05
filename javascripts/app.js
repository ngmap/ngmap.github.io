var app = angular.module("myapp",["ngMap", "ngd"]);

app.run(function($location, $rootScope, $anchorScroll) {
  try {
    $rootScope.page = $location.absUrl().match(/\/(\w+).htm/)[1];
  } catch(e) {
    $rootScope.page = 'basics';
  }

  /**
   * when the location is changed, scroll the page to the proper element.
   * by changing location hash from '/foo' to just 'foo', so that it can be used as $anchorScroll
   */
  $rootScope.$on('$locationChangeSuccess', function(newRoute, oldRoute) {
    $location.hash($location.path().replace(/^\//,"")); 
    $anchorScroll();  
  });
});

/**
 * config plnkr
 */
app.config(function(PlnkrDefaultProvider) {
  PlnkrDefaultProvider.setLibs([ /* plunker default libraries */
    "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=weather,visualization,panoramio",
    "http://code.angularjs.org/1.2.25/angular.js",
    "https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.js"
  ]);
  PlnkrDefaultProvider.setAppJs("var app=angular.module('myapp', ['ngMap']);");
});

