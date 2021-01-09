angular.module('directives').directive('issueCard', function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'common/directives/issueCard/issueCard.html',
    scope: {
      issue: "="
    },
    link: function(scope) { scope.issueTruncateLength = 240; },
    controller: ['$scope', function ($scope) {
      switch ($scope.issue.type) {
        case 'pact': {
          $scope.link = '/pacts/' + $scope.issue.id
          break
        }
        default: {
          $scope.link = '/issues/' + $scope.slug
        }
      }
    }]
  };
});
