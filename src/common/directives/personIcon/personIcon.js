'use strict';

angular.module('app').directive('personIcon', function() {
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