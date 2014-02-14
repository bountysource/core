'use strict';

angular.module('app.directives').directive('projectCard', [function() {
  return {
    restrict: "E",
    scope: {
      project: "="
    },
    templateUrl: "common/directives/projectCard/templates/projectCard.html"
  };
}]);