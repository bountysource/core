angular.module('directives').directive('backerThumbnails', function() {
  return {
    restrict: "E",
    scope: {
      issue: "="
    },
    templateUrl: "common/directives/backerThumbnails/backerThumbnails.html",
    replace: true
  };
});