'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/:id/settings', {
        templateUrl: 'pages/teams/settings.html',
        controller: 'BaseTeamController',
        resolve: $person
      });
  })
  .controller('EditTeamController', function ($scope, $routeParams, $location, $api) {
    $scope.team.then(function(team) {

      $scope.form_data = {
        name: team.name,
        slug: team.slug,
        url: team.url
      };

      $scope.save_team = function() {
        $api.team_update(company.slug, $scope.form_data).then(function(updated_team) {
          if (updated_team.error) {
            $scope.error = updated_team.error;
          } else {
            $location.url("/teams/"+updated_team.slug);
          }
        });
      };

    });

  });