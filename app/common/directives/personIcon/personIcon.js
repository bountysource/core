'use strict';

angular.module('bountysource.directives').directive('personIcon', function() {
  return {
    restrict: "E",
    scope: {
      person: "=",
      size: "@",
      format: "@"
    },
    templateUrl: "common/directives/personIcon/templates/personIcon.html",
    replace: true
  };
});