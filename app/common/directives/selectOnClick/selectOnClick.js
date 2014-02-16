'use strict';

angular.module('bountysource.directives').directive('selectOnClick', function () {
  return {
    restrict: "A",
    link: function (scope, element) {
      element.bind('click', function() {
        element[0].select();
      });
    }
  };
});