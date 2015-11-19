angular.module('app').config(function ($routeProvider, personResolver) {
  $routeProvider.when('/teams/:id/issue_suggestions', angular.extend({
    templateUrl: 'app/teams/issue_suggestions/index.html',
    container: false,
    resolve: { person: personResolver },
    controller: 'BaseTeamController',
    trackEvent: 'View Team Suggested Issues'
  }));
}).controller('TeamIssueSuggestionsController', function ($scope, $api, $routeParams, $location) {
  $scope.issue_suggestions = $api.issue_suggestions.query({ team: $scope.team.slug });

  $scope.goto_suggestion = function(issue) {
    $location.url("/teams/" + $scope.team.slug + "/issue_suggestions/" + issue.suggestion_id);
  };
});
