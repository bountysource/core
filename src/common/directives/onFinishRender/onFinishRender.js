'use strict';

angular.module('directives').directive('onFinishRender', function($timeout) {
  return {
    restrict: "A",
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
});

