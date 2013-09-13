'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/new', {
        templateUrl: 'pages/teams/new.html',
        controller: 'NewTeamController',
        resolve: $person,
        title: 'Create New Team'
      });
  })
  .controller('NewTeamController', function ($scope, $location, $api) {
    $scope.create_team = function () {
      $api.team_create($scope.form_data).then(function(team) {
        if (team.error) {
          $scope.error = team.error;
        } else {
          $location.url("/teams/"+team.slug);
        }
      });
    };
  });
