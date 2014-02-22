'use strict';

angular.module('app').directive('issueStatusLabel', function() {
  return {
    restrict: "E",
    scope: {
      issue: "="
    },
    templateUrl: "common/directives/issueStatusLabel/templates/issueStatusLabel.html"
  };
});