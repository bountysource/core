'use strict';

angular.module('app')
  .controller('BaseTeamController', function($scope, $location, $routeParams, $api) {
    $scope.team = $api.team_get($routeParams.id);
    $scope.set_team = function(team) {
      $scope.team = team;
    };

    $scope.team.then(function(team) {
      $scope.tabs = [
        { name: 'Projects', url: '/teams/' + team.slug }
      ];

      $scope.is_active = function(url) {
        return url === $location.path();
      };

      // not exactly correct anymore
      $scope.$watch('current_person', function(person) {
        if (person) {
          for (var i=0; i < team.members.length; i++) {
            if ((team.members[i].id === person.id) && team.members[i].is_admin) {
              $scope.is_admin = true;
              $scope.tabs.push({ name: 'Settings', url: '/teams/' + team.slug + '/settings' });
            }
          }
        }
      });
    });

  });
