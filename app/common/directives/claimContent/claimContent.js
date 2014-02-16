'use strict';

angular.module('bountysource.directives').directive('claimContent', function() {
  return {
    restrict: "E",
    scope: {
      claim: "=",
      issue: "="
    },
    templateUrl: "common/directives/claimContent/templates/claimContent.html",
    replace: true
  };
});