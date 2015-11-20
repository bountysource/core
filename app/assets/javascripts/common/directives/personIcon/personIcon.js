angular.module('directives').directive('personIcon', function() {
  return {
    restrict: "E",
    scope: {
      person: "=",
      size: "@",
      format: "@"
    },
    templateUrl: "common/directives/personIcon/personIcon.html",
    replace: true
  };
});