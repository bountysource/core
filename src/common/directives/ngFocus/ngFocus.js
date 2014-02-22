'use strict';

angular.module('app').directive('ngFocus', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr.ngFocus);
    element.bind('focus', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
});