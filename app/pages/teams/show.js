'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teams/:id', {
        templateUrl: 'pages/teams/show.html',
        controller: 'BaseTeamController'
      });
  })
  .controller('TeamTrackersController', function ($scope, $routeParams, $api, $pageTitle) {
    $scope.projects = [];

    $scope.team.then(function(team) {
      $pageTitle.set(team.name, 'Teams');

      $scope.doTypeahead = function($viewValue) {
        return $api.tracker_typeahead($viewValue);
      };

      $scope.$watch('project_search', function() {
        if ($scope.project_search) {
          $api.team_tracker_add(team.slug, $scope.project_search).then(function(updated_team) {
            $scope.set_team(updated_team);
          });
          $scope.project_search = null;
        }
      });

      $scope.remove_tracker = function(tracker_id) {
        $api.team_tracker_remove(team.slug, tracker_id).then(function(updated_team) {
          $scope.set_team(updated_team);
        });
      };
    });
  });
