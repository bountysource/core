'use strict';

angular.module('bountysource.directives').directive('fundraiserCard', [function() {
  return {
    restrict: "E",
    scope: {
      fundraiser: "="
    },
    templateUrl: "common/directives/fundraiserCard/templates/fundraiserCard.html"
  };
}]);