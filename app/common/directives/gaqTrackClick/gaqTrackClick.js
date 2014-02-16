'use strict';

angular.module('bountysource.directives').directive('gaqTrackClick', ['$timeout', '$window', function($timeout, $window) {
  return {
    restrict: "AC",
    link: function(scope, element, attrs) {
      element.bind('click', function(e){
        e.preventDefault();
      });
      var gaqArgsWatcher = scope.$watch(attrs.gaqArgs, function(gaqArgs) {
        gaqArgsWatcher();
        if (gaqArgs) {
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
}]);