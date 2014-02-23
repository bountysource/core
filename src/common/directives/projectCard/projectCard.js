'use strict';

angular.module('directives').directive('projectCard', function() {
  return {
    restrict: "E",
    scope: {
      project: "="
    },
    templateUrl: "common/directives/projectCard/templates/projectCard.html"
  };
});