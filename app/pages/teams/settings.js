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

    //hide the type option if on settings page
    $scope.settings_page = true;

    $scope.$watch('is_admin', function(value) {
      if (value === false) {
        $location.path("/teams/"+$routeParams.id).replace();
      }
    });

    $scope.form_data = {};

    $scope.team.then(function(team) {
      $scope.form_data = {
        name: team.name,
        slug: team.slug,
        url: team.url,
        bio: team.bio
      };

      $scope.save_team = function() {
        $api.team_update(team.slug, $scope.form_data).then(function(updated_team) {
          if (updated_team.error) {
            $scope.error = updated_team.error;
          } else {
            $location.url("/teams/"+updated_team.slug);
          }
        });
      };
    });
  });
