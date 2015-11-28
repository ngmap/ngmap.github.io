/**
 * Submit to plunker
 */
(function() {
  'use strict';
  var submitToPlunker = function(html) {
    var form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'post';
    form.action = 'https://plnkr.co/edit/?p=preview';
    var postData = {
      description: "AngularJS Google Maps Directive",
      'private': true,
      'tags[]': 'auglarjs',
      'files[index.html]': html
    };
    for(var key in postData) {
      var input = document.createElement('input');
      input.type = "hidden";
      input.name = key;
      input.value = postData[key];
      form.appendChild(input);
    }
    form.submit();
    form.remove();
  };

  var jvPlunker = function() {
    return {
     submitToPlunker: submitToPlunker
    };
  };

  angular.module('jvDirectives').
    factory('jvPlunker', jvPlunker);
})();
