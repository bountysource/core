'use strict';

angular.module('app').directive('projectCard', function() {
  return {
    restrict: "E",
    scope: {
      project: "="
    },
    templateUrl: "common/directives/projectCard/templates/projectCard.html"
  };
});