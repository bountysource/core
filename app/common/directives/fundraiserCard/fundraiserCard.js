'use strict';

angular.module('app.directives').directive('fundraiserCard', function() {
  return {
    restrict: "E",
    scope: {
      fundraiser: "="
    },
    templateUrl: "common/directives/fundraiserCard/templates/fundraiserCard.html"
  };
});