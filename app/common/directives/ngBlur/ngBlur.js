'use strict';

angular.module('bountysource.directives').directive('ngBlur', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr.ngBlur);
    element.bind('blur', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
});