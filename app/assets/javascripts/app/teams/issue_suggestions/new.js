'use strict';

angular.module('app').config(function ($routeProvider, personResolver) {
  $routeProvider.when('/teams/:id/issue_suggestions/new', angular.extend({
    templateUrl: 'app/teams/issue_suggestions/new.html',
    container: false,
    resolve: { person: personResolver },
    controller: 'BaseTeamController',
    trackEvent: 'View Suggest an Issue'
  }));
}).controller('IssueSuggestionsNewController', function ($scope, $api, $routeParams, $location, $route, $pageTitle) {

  $scope.$watch('team', function(team) {
    if (team) {
      $pageTitle.set('Suggest an Issue', team.name, 'Bountysource');
    }
  });

  $scope.form_data = {};
  $scope.submit_form = function() {
    $scope.errors = null;
    $api.issue_suggestions.create({
      team: $routeParams.id,
      url: $scope.form_data.url,
      description: $scope.form_data.description,
      can_solve: $scope.form_data.can_solve,
      suggested_bounty_amount: $scope.form_data.suggested_bounty_amount
    }, function(response) {
      if (response.errors) {
        $scope.errors = response.errors;
      } else {
        $scope.success = true;
      }
    });
  };

  $scope.suggest_new_issue = function() {
    $route.reload();
  };
});
