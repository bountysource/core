'use strict';

angular.module('directives').directive('fundraiserCard', function() {
  return {
    restrict: "E",
    scope: {
      fundraiser: "="
    },
    templateUrl: "common/directives/fundraiserCard/templates/fundraiserCard.html"
  };
});