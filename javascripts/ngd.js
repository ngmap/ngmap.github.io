/**
 * Set the height of textarea automatically by the height of contents
 */
var NGD = NGD || angular.module('ngd',[]);
NGD.directive('ngdAutoHeight', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, elem) {
      $timeout( function() { // Expand the textarea as soon as it is added to the DOM
        if ( elem.html() ) {
          var height = elem[0].scrollHeight;
          elem.css({height:height+'px'});
        }
      }, 100);
    }
  };
});

/**
 * builds the proper browser understanding code from human understanding code
  */
var NGD = NGD || angular.module('ngd',[]);
NGD.directive('ngdCode', function() {
  return {
    restrict: 'A',
    link: function($scope, elem) {
      var code = elem.html();
      code = code.replace(/^[\r\n]/,"");    //remove the first linefeed
      code = code.replace(/[\r\n]\s+$/,""); //remove the last linefeed 
      var indent = code.match(/^\s+/);      //get the first indentation
      if (indent) {                         //replace all leading indentation
        var re = new RegExp("^"+indent, "gm");
        code = code.replace(re, "");
      }
      elem.html(code);
    }
  };
});

/**
 * use Enter Key pressed on element
 */
var NGD = NGD || angular.module('ngd', []);
NGD.directive('ngdEnter', ['$parse', '$rootScope', function ($parse, $rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, controller) {
      var fn = $parse(attrs.ngdEnter);
      element.on('keypress', function(event) {
        if (event.which === 13) {
          var callback = function() {
            fn(scope, {$event:event});
          };
          if ($rootScope.$$phase) {
            scope.$evalAsync(callback);
          } else {
            scope.$apply(callback);
          }
        }
      });
     }
  };
}]);

/**
 * Set top position under the given element
 */
var NGD = NGD || angular.module('ngd',[]);

NGD.directive('ngdFixedUnder', ['$window', function($window) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      var header = document.querySelector(attrs.ngdFixedUnder);
      if (header) {
        angular.element($window).bind('scroll', function() {
          var rect = header.getBoundingClientRect();
          if (parseFloat(rect.bottom)<0) {
            element.css({position:'fixed', top: 0});
          } else {
            element.css({position:'absolute', top: null});
          }
        });
      } else {
        throw "ngd-fixed-under, no element found by value";
      } // if
    } // link
  }; // return
}]);

var NGD = NGD || angular.module('ngd',[]);
NGD.factory('NgdFlash', function($window) {
  return {
    push: function(msg) {
      $window.sessionStorage.ngdFlashMessage = msg;
    },
    pull: function() {
      var msg = $window.sessionStorage.ngdFlashMessage;
      (msg) && (delete $window.sessionStorage.ngdFlashMessage);
      return msg;
    }
  }
});
NGD.directive('ngdFlash', function(NgdFlash) {
  return {
    restrict: 'A',
    link: function($scope, elem, attrs) {
      var msg = NgdFlash.pull();
      elem.html(msg);
    }
  };
});

/**
 * show unsaved changes warning on the form if changed and not submitted
 */
var NGD = NGD || angular.module('ngd', []);
NGD.directive('ngdFormUnsaved',['$window', function($window) {
  return {
    restrict: 'A',
    require: 'form', // we must require form to get access to formController
    link: function(scope, formElement, attrs, formController) {
      /** 
       * when form is submitted, set onSubmit flag, so that no warning to show up
       */
      formElement.bind('submit', function() {
        formController.onSubmit = true;
      });
      var prevHandler = $window.onbeforeunload;
      var onbeforeunloadFunc = function(event) {
        event.preventDefault();
        prevHandler && prevHandler(event);
        if (!formController.onSubmit && formController.$dirty) {
          return attrs.ngdFormUnsaved || "Are You Sure?";
        } 
      }
      $window.onbeforeunload = onbeforeunloadFunc;
    } // link
  };
}]);

/**
 * To perform action when image is dragged and dropped on and element
 * You can drop image from your file browser as a file or web browser as a url
 */
var NGD = NGD || angular.module('ngd', []);
NGD.directive("ngdImageDrop", ['$parse', function ($parse) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var ngdImageDrop = $parse(attrs.ngdImageDrop); 

      element.bind("dragover", function (e) {
        e.preventDefault();
        element.addClass("dragover");
      });

      element.bind("dragleave", function(e) {
        e.preventDefault();
        angular.element(document.body).removeClass('dragover');
      });
      
      element.bind("drop", function (e) {
        e.preventDefault();
        element.removeClass('dragover');
        var files = [];
        for (var i=0; i<e.dataTransfer.files.length; i++) {
          if (e.dataTransfer.files[i].type.match("image")) {
            files.push(e.dataTransfer.files[i]);
          }
        }
        if (files.length > 0) {
          console.log('files', {files: files});
          scope.$emit("ngd-image-dropped", {files: (files.length ? files : [files])});
          scope.$apply(ngdImageDrop(scope));
        }

        var url = e.dataTransfer.getData('URL');
        if (url.match(/\.(png|gif|jpg)$/)) {
          console.log('url', {url: url});
          scope.$emit("ngd-image-dropped", {url:url});
          scope.$apply(ngdImageDrop(scope));
        }
      });
    }
  };
}]);


/**
 * To perform action when image is pasted to the document
 */
var NGD = NGD || angular.module('ngd', []);
NGD.directive("ngdImagePaste",['$parse', '$http', function($parse, $http) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var ngdImagePaste = $parse(attrs.ngdImagePaste); 

      element.bind("paste", function (e) {
        var imageFiles = [];
        var items =  (event.clipboardData || event.originalEvent.clipboardData).items;
        console.log('items.length', items.length);
        for (var i=0; i<items.length; i++) {
        console.log('items[i]', items[i]);
          if (items[i].getAsFile().type.match("image")) {
            console.log('adding');
            imageFiles.push(items[i].getAsFile());
          }
        }
        if (imageFiles.length > 0) {
          console.log('emitting');
          scope.$emit('ngd-image-dropped', {files: imageFiles});
          scope.$apply(ngdImagePaste(scope));
        }
      }); // bind
    } // link
  }; // return
}]);


/**
 * To preview images by adding/removing image files from controller scope
 */
var NGD  = NGD || angular.module('ngd', []);
NGD.directive("ngdImagePreview", function() {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {

      element.attr('draggable', true); // so that, we can remove it
      element.bind('dragleave', function(e)  {
        if (e.target.tagName == "IMG") {
          e.target.parentNode.removeChild(e.target);
        }
      });

      scope.$on('ngd-image-dropped', function(event, options) {
        var getImage = function(src) {
          var width = attrs.ngdImagePreviewWidth || attrs.width;
          var height = attrs.ngdImagePreviewHeight || attrs.height;
          var image = new Image();
          image.src = src;
          width && (image.width = width);
          height && (image.height = height);
          return image;
        }
        var fileOnLoad = function(event) {
          var image = getImage(event.target.result);
          var imgEl = element[0].querySelector("img[src=\""+event.target.result+"\"]");
          if (!imgEl) {
            element[0].appendChild(image);
          }
        };
        if (options.files) {
          for (var i = 0; i< options.files.length; i++) {
            var file = options.files[i];
            var fileReader = new FileReader();
            fileReader.onload = fileOnLoad;
            fileReader.readAsDataURL(file);
          }
        } else if (options.url) {
          var imgEl = element[0].querySelector("img[src=\""+options.url+"\"]");
          if (!imgEl) {
            var image = getImage(options.url);
            element[0].appendChild(image);
          }
        }
      });
    } // link
  }; // return
});

/**
 * Provides a service to preview markdown inside an element
 *
 * Example
 *  <script src="http://cdnjs.cloudflare.com/ajax/libs/pagedown/1.0/Markdown.Converter.js"></script>
 *  <textarea ng-model="markdown">
 *  Header
 *  ======
 *  *italic*
 *  </textarea>
 *  <a href="" ng-click="markdownPreview.convert(markdown)">Preview</a>
 *  <div ngd-markdown-preview>
 *    Markdown preview goes here
 *  </div>
 */
if(typeof Markdown === "undefined") {
  var scriptEl = document.createElement('script');
  scriptEl.src = "http://cdnjs.cloudflare.com/ajax/libs/pagedown/1.0/Markdown.Converter.js";
  document.head.appendChild(scriptEl);
}
var NGD = NGD || angular.module('ngd', []);
NGD.directive('ngdMarkdownPreview', function() {
  return {
    link: function(scope, element, attrs) {
      //add convert(str) method to the element
      var converter = new Markdown.Converter();
      element[0].convert = function(markdown) {
        markdown = markdown || element.html();
        var html = converter.makeHtml(markdown);
        html = html.replace(/amp;/g,"");
        element.html(html);
      };

      //default preview; scope.markdown or html
      if (scope.markdown) {
        element[0].convert(scope.markdown);
      } else if (element.html().trim() !== "") {
        element[0].convert(element.html());
      }

      //define scope.markdownPreview(s)
      scope.markdownPreviews = scope.markdownPreviews || {};
      if (attrs.id) {
        scope.markdownPreviews[attrs.id] = element[0];
      }
      scope.markdownPreview = element[0];

      //define scope.converMarkdown
      scope.convertMarkdown = function(id, markdown) {
        var el = document.querySelector("*[ngd-markdown-preview]#"+id);
        el.convert(markdown);
      };
    }
  };
});

/**
 * To show customized modal window on full document or a specific element
 */
var NGD = NGD || angular.module('ngd', []);
NGD.directive('ngdOverlay', ['$compile', '$window', function($compile, $window) {
  return {
    link: function(scope, element, attrs) {
      var overlayId = attrs.ngdOverlay;
      var overlayStyle = attrs.ngdOverlayStyle;
      var overlayDfltCss = (attrs.ngdOverlayNocss === undefined);
      /**
       * change the element to have background and contents
       */
      var contentsEl = element[0].querySelector(".ngd-overlay-contents");
      if (!contentsEl) {
        var contentsElHtml = 
          "<div class='ngd-overlay-contents'>"+
            element.html()+
          "</div>"; 
        element.html(contentsElHtml);
        $compile(element.contents())(scope);
      }
      element.css({
        display: 'none',
        top: 0,
        left: 0,
        zIndex: 100,
        background: (overlayDfltCss && "rgba(0,0,0,0.5)")
      });

      /**
       * provide ngdOverlay functions to scope
       */
      scope.ngdOverlays = scope.ngdOverlays || {};
      scope.ngdOverlays[overlayId] = element;
      scope.ngdOverlay = {
        show : function(overlayId, targetEl) {
          var overlayEl = scope.ngdOverlays[overlayId];
          var supportPageOffset = window.pageXOffset !== undefined;
          var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
          var scrollX = supportPageOffset ? window.pageXOffset : 
                  isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
          var scrollY = supportPageOffset ? window.pageYOffset : 
                  isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

          if (typeof targetEl == "string") {
            targetEl = document.querySelector(targetEl);
          }
          if (targetEl) {
            /**
             * Move the overlay to the bottom of the document
             */
            document.querySelector('body').appendChild(element[0]);
            var targetBCR = targetEl.getBoundingClientRect();
            var targetElHeight;
            if (overlayEl) {
              if (targetEl.tagName == "BODY") {
                overlayEl.css({
                  position: 'fixed',
                  display: 'block',
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                });
                targetElHeight = $window.innerHeight;
                targetElWidth = $window.innerWidth;
              } else {
                overlayEl.css({
                  position: 'absolute',
                  display: 'block',
                  top: scrollY + targetBCR.top + 'px',
                  left: scrollX +targetBCR.left +  'px',
                  width: targetBCR.width + "px",
                  height: targetBCR.height + "px",
                });
                targetElHeight = targetBCR.height;
                targetElWidth = targetBCR.width;
              }
              var contentsEl = overlayEl[0].querySelector(".ngd-overlay-contents");
              var contentsElCss = overlayDfltCss ? {
                background: "#fff",
                display: 'inline-block',
                position: 'absolute',
                textAlign: 'center',
                minWidth: '300px',
                minHeight: '100px'
              } : {};
              angular.element(contentsEl).css(contentsElCss); // <-- !important
              var contentsBCR = contentsEl.getBoundingClientRect();
              console.log('contentsBCR', contentsBCR);
              console.log('targetElWidth', targetElWidth);
              console.log('targetElHeight', targetElHeight);
              angular.extend(contentsElCss, {
                top : Math.max((targetElHeight - contentsBCR.height)/2, 0) + 'px',
                left: Math.max((targetElWidth - contentsBCR.width)/2, 0) + 'px'
              });
              angular.element(contentsEl).css(contentsElCss);
            }
          } else { 
            throw "invalid overlay target given, " + targetEl;
          }
        },  // show: {
        hide: function(overlayId) {
          var overlayEl = scope.ngdOverlays[overlayId];
          if (overlayEl) {
            overlayEl.css({
              position: null,
              display: 'none',
              width: null,
              height: null,
              zindex: null
            });
          }
        }  // hide : {
      }; // scope.ngdOverlay
    } // link
  }; // return
}]);

var NGD = NGD || angular.module('ngd',[]);

/**
 * AJAX url is not a javascript but a JSON, 
 * Thus, we cannot use AJAX get url with <script> tag. It just perform empty action.
 *
 * Assign script contents to a scope variable
 *
 * Example: 
 *   <script src="foo.json" ngd-preload-var="myVar"></script>
 *
 * This will assign $scope.myVar with foo.json contents
 */
NGD.directive('ngdPreloadVar', function($http) {
  return {
    link: function(scope, elem, attrs) {
      if (elem[0].tagName !== "SCRIPT") {
        throw "Invalid tag. ngd-scope-var only applies to <script> tag";
      } else if (!attrs.ngdPreloadVar) {
        throw "Invalid value. ngd-scope-var requires a scope variable name";
      }
      if (attrs.src) {
        $http.get(attrs.src)
          .success(function(data) {
            scope[attrs.ngdPreloadVar] = data;
            scope.$apply();
          }).error( function() {
            console.error("Failed to read "+attrs.src);
          });
      }
    } // link
  };
});

var NGD = NGD || angular.module('ngd',[]);
NGD.directive('ngdScript', function($http) {
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      if (attrs.src && attrs.scopeVar) {// read src, then assign to a variable
        $http.get(attrs.src)
          .success(function(data) {
            scope[attrs.scopeVar] = data;
          }).error( function() {
            console.error("Failed to read "+attrs.src);
          });
      } else {
        var scriptEl = document.createElement("script");
        scriptEl.type = "text/javascript";                
        if (attrs.src) {           // add <script> to <head>
          scriptEl = attrs.src;
        } else {
          var code = elem.text();
          scriptEl.text = code;
        }
        document.head.appendChild(scriptEl);
      }
      elem.remove();
    } // link
  };
});

var NGD = NGD || angular.module('ngd',[]);
NGD.directive('ngdTree', function() {
  var defaultStyle = 
    'ul[ngd-tree] ul { margin:0px }\n'+
    'ul[ngd-tree] li { list-style: none; }\n'+
    'ul[ngd-tree] li:not(.on) ul {  display: none; }\n'+
    'ul[ngd-tree] li:before { content: " "; display: inline-block; width: 7%;}\n'+
    'ul[ngd-tree] li > *:not(ul) { display: inline-block; width: 90%; border-bottom: 1px solid #ddd}\n'+
    'ul[ngd-tree] li.has-ul:before { content: "▸"; }\n'+
    'ul[ngd-tree] li.has-ul.on:before { content: "▾"; }\n';
  return {
    link: function(scope, element, attrs) {
      /**
       * set the default style of ngd-tree if not defined
       */
      var styleTag = document.querySelector("head style#ngd-tree-css");
      if (!styleTag) {
        var head = document.querySelector("head");
        var styleEl =angular.element("<style type='text/css' id='ngd-tree-css'>"+defaultStyle+"</style>");
        head.appendChild(styleEl[0]);
      }
      
      /**
       * find all <li> element that has <ul>, then set "has-ul" class
       */
      var liEls = element.find("li");
      for (var i=0; i<liEls.length; i++) {
        var li = liEls[i];
        if (li.querySelector("ul")) {
          angular.element(li).addClass("has-ul");
        }
      }
      
      /**
       * attach click event listener for on/off collapsing
       */
      element.find("li").on("click", function(event) {
        var targetEl = angular.element(event.target);
        if (targetEl.prop('tagName') == "LI" && targetEl.hasClass("has-ul")) { 
          angular.element(this).toggleClass("on");
          event.stopPropagation();
        }
      });
    }
  };
});

/* global jQuery */
var NGD= NGD|| angular.module('ngd', []);

NGD.isElementIn = function(innerEl, outerEl) {
  innerEl.length && (innerEl = innerEl[0]);
  outerEl.length && (outerEl = outerEl[0]);

  (typeof jQuery === "function" && innerEl instanceof jQuery) && (innerEl = innerEl[0]);
  (typeof jQuery === "function" && outerEl instanceof jQuery) && (outerEl = outerEl[0]);
  var innerRect = innerEl.getBoundingClientRect();
  if (outerEl instanceof Window || outerEl.constructor.name == "Window") {
    return (
      innerRect.top >= 0 && innerRect.left >= 0 &&
      innerRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
      innerRect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  } else {
    var outerRect = outerEl.getBoundingClientRect();
    return (
      innerRect.top >= outerRect.top && 
      innerRect.left >= outerRect.left &&
      innerRect.bottom <= outerRect.bottom &&
      innerRect.right <= outerRect.right
    );
  }
};

NGD.service('NgdViewport', function() {
  return { 
    currentId: null, 
    currentEl: null, 
    elements : {},
    selectorToSpy: null,
    attrToSpy: 'id',
    selectorToNav: null,
    attrToNav: 'href',
    classForNav: 'active'
  };
});

/**
 * collect all elements matching the selecor
 * then, set the element in the current viewport while scrolling
 */
NGD.directive('ngdViewport', ['$window', 'NgdViewport',
  function($window, NgdViewport) {
    return {
      link: function(scope, element, attrs) {
        if (NgdViewport.selectorToSpy) {
          throw "Only one ngd-viewport is allowed in a document";
        }
        NgdViewport.selectorToSpy = attrs.ngdViewport || "a[id]";
        var matches = NgdViewport.selectorToSpy.match(/\[(.*)\]/);
        NgdViewport.attrToSpy = matches[1];
        var elementsToSpy = element[0].querySelectorAll(NgdViewport.selectorToSpy);
        for (var i=0; i<elementsToSpy.length; i++) {
          var viewportEl = elementsToSpy[i];
          var viewportElAttr = viewportEl.getAttribute(NgdViewport.attrToSpy);
          if (viewportElAttr) {
            if (NgdViewport.elements[viewportElAttr]) { // already added
              console.log('id', viewportElAttr, 'is already added to ngd-viewport');
            } else {
              NgdViewport.elements[viewportElAttr] = viewportEl; 
            }
          } else {
            throw "requires value in attribute, "+NgdViewport.selectorToSpy+" in ng-viewport";
          }
        }
        var outerEl = element.prop('tagName') == 'BODY' ? angular.element($window) : element;
        outerEl.bind('scroll', function() {
          for (var key in NgdViewport.elements) {
            var innerEl = NgdViewport.elements[key];
            if (NGD.isElementIn(innerEl, outerEl)) {
              NgdViewport.currentEl = innerEl;
              NgdViewport.currentId = innerEl.getAttribute(NgdViewport.attrToSpy);
              scope.$apply();
              break;
            }
          } 
        });
      } // link
    }; // return
  } // function 
]);

/**
 * set class name to matching element of NgdViewport.currentEl
 */
NGD.directive('ngdViewportNav', ['NgdViewport',
  function(NgdViewport) {
    return {
      link: function(scope, element, attrs) {
        if (NgdViewport.selectorToNav) {
          throw "Only one ngd-viewport-nav is allowed in a document";
        }
        scope.NgdViewport = NgdViewport;
        NgdViewport.selectorToNav = attrs.ngdViewportNav || "a[href]";
        var matches = NgdViewport.selectorToNav.match(/\[(.*)\]/);
        if (!matches) {
          throw "invalid selector for ngdViewportNav";
        }
        NgdViewport.attrToNav = matches[1];
        scope.$watch('NgdViewport.currentEl', function(currentEl) {
          if (currentEl) {
            var links = element[0].querySelectorAll(NgdViewport.selectorToNav);
            for (var i=0; i<links.length; i++) {
              var navEl = angular.element(links[i]);
              var navAttrVal = links[i].getAttribute(NgdViewport.attrToNav);
              var elAttrVal = currentEl.getAttribute(NgdViewport.attrToSpy);
              if ( navAttrVal.match(new RegExp("#"+elAttrVal+'$'))) {
                navEl.addClass(NgdViewport.classForNav);
              } else {
                navEl.removeClass(NgdViewport.classForNav);
              }
            }
          }
        });
      }
    };
  } //function 
]);

/**
 * Sets classname of selected navigation section
 */
NGD.directive('ngdViewportNavClass', ['NgdViewport',
  function(NgdViewport) {
    return {
      link: function(scope, element, attrs) {
        NgdViewport.classForNav = attrs.ngdViewportNavClass;
      }
    };
  }
]);

/**
 * Only used when watch-viewport-selector is dynamically updated, ie. ng-repeat
 */
NGD.directive('ngdViewportEl', ['NgdViewport', 
  function(NgdViewport) {
    return {
      link: function(scope, element, attrs) {
        var id = ((""+attrs.ngdViewportEl) === "")? attrs.id : attrs.ngdViewportEl;
        if (NgdViewport.elements[id]) { // already added
          console.log('id', id, 'is already added to ngd-viewport');
        } else {
          NgdViewport.elements[id] = element[0];
        }
      }
    };
  }
]);
