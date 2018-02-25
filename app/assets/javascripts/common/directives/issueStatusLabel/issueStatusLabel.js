angular.module('directives').directive('issueStatusLabel', function() {
  return {
    restrict: "E",
    scope: {
      issue: "=",
      size: '@'
    },
    templateUrl: "common/directives/issueStatusLabel/issueStatusLabel.html"
  };
});