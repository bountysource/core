angular.module('directives').directive('issueCard', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/issueCard/issueCard.html',
    scope: {
      issue: "=",
    }
  };
});
