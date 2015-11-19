angular.module('directives').directive('claimContent', function() {
  return {
    restrict: "E",
    scope: {
      claim: "=",
      issue: "="
    },
    templateUrl: "common/directives/claimContent/claimContent.html",
    replace: true
  };
});