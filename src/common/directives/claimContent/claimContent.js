'use strict';

angular.module('app').directive('claimContent', function() {
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