'use strict';

angular.module('app.directives').directive('selectOnClick', [function () {
  return {
    restrict: "A",
    link: function (scope, element) {
      element.bind('click', function() {
        element[0].select();
      });
    }
  };
}]);