(function(){
  'use strict';
  var plunker = function() {

    this.libs = [];
    this.appJs = null;
    this.$get = function() {
      var libs = this.libs;
      var appJs = this.appJs;
      return {
        getLibs: function() {
          return libs;
        },
        getAppJs: function() {
          return appJs;
        }
      };
    };

    this.setLibs = function(libs) {
      this.libs = libs;
    };

    this.setAppJs= function(jsCode) {
      this.appJs = jsCode;
    };
  };
  angular.module("angularjs-plunker", []);
  angular.module("angularjs-plunker").provider("plunker", plunker);
})();


(function(){
  'use strict';

  var urlToHtmlTag = function(url) {
    var linkTag   = '<link rel="stylesheet" href="' + url + '"/>';
    var scriptTag = '<script src="' + url +'"></'+'script>';
    return url.match(/\.css$/) ? linkTag : scriptTag;
  };

  var plunkerCtrl = function(plunker) {
    this.html;
    this.js;
    this.css;
    this.moduleName;
    this.moduleDependencies;
    this.libs = [];

    this.getPlunkerScript = function(jsCode) {
      var appJs = angular.copy(plunker.getAppJs());
      if (jsCode && !jsCode.match(/var[ ]+app[ ]*=/)) { 

        if (appJs) {
          jsCode = appJs + "\n" + jsCode;
        } else {
          jsCode = "var app = angular.module('"+
            this.moduleName+"', ["+ this.moduleDependencies+"]);\n" +
            jsCode;
        }
      }
      jsCode = jsCode.replace(
        /angular\.module\(['"]([^'"]+)['"]\)/g,
        "angular.module('"+this.moduleName+"')"
      );
      return jsCode;
    };
    
    this.submitToPlnkr = function(postData) {
      var form = document.createElement('form');
      form.style.display = 'none';
      form.target = '_blank';
      form.method = 'post';
      form.action = 'http://plnkr.co/edit/?p=preview';
      for(var key in postData) {
        if (key) {
          var input = document.createElement('input');
          input.type = "hidden";
          input.name = key;
          input.value = postData[key];
          form.appendChild(input);
        }
      }
      form.submit();
      form.remove();
    };

    this.getPostData = function(js, css, contents) {
      /**
       * head tags
       *   1. predefined library tag. e.g., jquery.js
       *   2. user-defined library tab e.g. <plukner-lib src='my.script.js" />
       *   3. script.js for javaScript code
       *   4. style.css for css code
       */
      var headTags = [];
      var libs = (plunker.getLibs() || []).concat(this.libs, ['script.js', 'style.css']);
      for (var i=0; i<libs.length; i++) {
        var url = libs[i];
        url && headTags.push(urlToHtmlTag(url));
      }

      var postData = {};
      postData.description = "AngularJS Google Maps Directive";
      postData.private = true;
      postData['tags[]'] = 'auglarjs';
      postData['files[script.js]'] = js;
      postData['files[style.css]'] = css;
      postData['files[index.html]'] = 
        '<!doctype html>\n' +
        '<html ng-app="' + this.moduleName + '">\n' +
        '  <head>\n' +
             headTags.join('\n') + '\n' +
        '  </head>\n' +
        '  <body>\n' +
             contents + '\n' +
        '  </body>\n' +
        '</html>\n';

      return postData;
    };
  };
  plunkerCtrl.$inject = ['plunker'];

  var linkFunc = function(scope, element, attrs, ctrl, transclude) {
    ctrl.moduleName = attrs.moduleName || 'plunker';
    ctrl.moduleDependencies = attrs.moduleDependencies;
    transclude(scope, function(clone) {
     element.append(clone);
    });
  };

  var plunker = function() {
    console.log('plunker');

    return {
      restrictTo: 'E',
      transclude: true,
      scope: {}, //isolate the scope to have its own
      link: linkFunc,
      controller: plunkerCtrl
    }; // return
  };

  angular.module('angularjs-plunker').directive('plunker', plunker);
})();

(function() {
  'use strict';
  var plunkerCode = function() {

    var jsCode, cssCode, htmlCode;

    var linkFunc = function(js, css, html) {
      return function(scope, element, attrs, controller) {
        console.log('plunker-code link', attrs.type);

        js && (controller.js = js);
        css && (controller.css = css);
        html && (controller.html = html);
      };
    };
    
    function addScript(script, toEl) {
      var str = "<script>"+script+"<\/script>";
      var newdiv = document.createElement('div');
      newdiv.innerHTML = str;
      toEl.appendChild(newdiv);
    }

    return {
      require: '^plunker',
      compile: function(element, attrs) {
        var type = attrs.type;
        if (type === 'js') {
          jsCode = attrs.src ? attrs.src : element.html().replace(/<script>.*<\/script>/g,'');
        } else if (type === "css") {
          cssCode = attrs.src ? attrs.src : element.html();
        } else if (type === "html") {
          htmlCode = attrs.src ?  attrs.src : element.html();
          (attrs.codeOnly !== undefined) && element.html('');
        }
        
        return linkFunc(jsCode, cssCode, htmlCode);
      }
    };
  };
  angular.module('angularjs-plunker').directive('plunkerCode', plunkerCode);
})();

(function() {
  'use strict';
  var plunkerLib = function() {
    'use strict';

    return {
      require: '^plunker',
      link: function(scope, element, attrs, controller) {
        var url = attrs.src || attrs.href;
        controller.libs.push(url);
      }
    };
  };

  angular.module("angularjs-plunker").directive('plunkerLib', plunkerLib);
})();

(function() {
  'use strict';

  var defaultTemplate = 
    '<div>\n' +
    '  <div class="tabs" ng-init="tab=1">\n' +
    '    <a ng-class="{active:tab==1,hide:!html}" ng-click="tab=1">HTML</a>\n' +
    '    <a ng-class="{active:tab==2,hide:!js}" ng-click="tab=2">Script</a>\n' +
    '    <a ng-class="{active:tab==3,hide:!css}" ng-click="tab=3">CSS</a>\n' +
    '    <a href="#" ng-click="submitToPlunker()">Edit in plunker</a>\n' +
    '  </div>\n' +
    '  <div class="tab-contents">\n' +
    '    <div ng-show="tab==1">{{html}}</div>\n' +
    '    <div ng-show="tab==2">{{js}}</div>\n' +
    '    <div ng-show="tab==3">{{css}}</div>\n' +
    '  </div>\n' +
    '</div>';

  var getIndentedCode = function(code) {
    code = code.replace(/^\s*[\r\n]/,""); //remove empty first line
    code = code.replace(/[\r\n]\s+$/,""); //remove the last linefeed 
    var indent = code.match(/^\s+/);      //get the first indentation
    if (indent) {                         //replace all leading indentation
      var re = new RegExp("^"+indent, "gm");
      code = code.replace(re, "");
    }
    return code;
  };

  var plunkerShow = function($http, $templateCache) {
    console.log('plunker-show');
    $templateCache.put('plunker-show-default-template.html', defaultTemplate); 
   
    return {
      require: '^plunker',
      templateUrl: function(elem,attrs) {
        return attrs.templateUrl || 'plunker-show-default-template.html'; 
      },
      link: function(scope, element, attrs, ctrl) {
        scope.submitToPlunker = function() {
          var postData = ctrl.getPostData(scope.js, scope.css, scope.html);
          ctrl.submitToPlnkr(postData);
        };
        if (ctrl.js && ctrl.js.match(/\.js$/)) {
          $http.get(ctrl.js).success(function(data) {
            scope.js = getIndentedCode(data);
            scope.js = ctrl.getPlunkerScript(scope.js);
          });
        } else if (ctrl.js) {
          scope.js = getIndentedCode(ctrl.js);
          scope.js = ctrl.getPlunkerScript(scope.js);
        }

        if (ctrl.css && ctrl.css.match(/\.css$/)) {
          $http.get(ctrl.css).success(function(data) {
            scope.css = getIndentedCode(data);
          });
        } else if (ctrl.css) {
          scope.css = getIndentedCode(ctrl.css);
        }

        if (ctrl.html && ctrl.html.match(/\.html?$/)) {
          $http.get(ctrl.html).success(function(data) {
            scope.html = getIndentedCode(data);
            scope.html = scope.html.replace(/\ (init-event|style)=['"][^'"]+['"]/g,"");
          });
        } else if (ctrl.html) {
          scope.html = getIndentedCode(ctrl.html);
          scope.html = scope.html.replace(/\ (init-event|style)=['"][^'"]+['"]/g,"");
        }
      } 
    };
  };
  plunkerShow.$inject = ['$http', '$templateCache'];

  angular.module('angularjs-plunker').directive('plunkerShow', plunkerShow); 
})();
