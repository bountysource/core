'use strict';

angular.module('directives').directive('gaqTrackClick', function($timeout, $window) {
  return {
    restrict: "AC",
    link: function(scope, element, attrs) {
      element.bind('click', function(e){
        e.preventDefault();
      });
      var gaqArgsWatcher = scope.$watch(attrs.gaqArgs, function(gaqArgs) {
        gaqArgsWatcher();
        if (gaqArgs && angular.isDefined($window._gaq)) {
          element.bind('click', function(){
            gaqArgs.push(attrs.href);
            $window._gaq.push(gaqArgs);

            $timeout(function() {
              $window.location = attrs.href;
            }, 250);
          });
        }
      });
    }
  };
});