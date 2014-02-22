'use strict';

angular.module('app').directive('backerThumbnails', function() {
  return {
    restrict: "E",
    scope: {
      issue: "="
    },
    templateUrl: "common/directives/backerThumbnails/templates/backerThumbnails.html",
    replace: true
  };
});