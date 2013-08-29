'use strict';

angular.module('app')
  .controller('BaseTeamController', function($scope, $location, $routeParams, $api) {
    $scope.team = $api.team_get($routeParams.id);

    $scope.set_team = function(team) {
      $scope.team = team;
    };

    $scope.active_tab = function(tab) {
      if (tab === 'projects' && (/^\/teams\/[^\/]+$/).test($location.path())) { return true; }
      else if (tab === 'members' && (/^\/teams\/[^\/]+\/members$/).test($location.path())) { return true; }
      else if (tab === 'manage_members' && (/^\/teams\/[^\/]+\/members\/manage$/).test($location.path())) { return true; }
      else if (tab === 'settings' && (/^\/teams\/[^\/]+\/settings$/).test($location.path())) { return true; }
    };

    $scope.members = $api.team_members_get($routeParams.id).then(function(members) {
      $scope.$watch('current_person', function(person) {
        if (person) {
          for (var i=0; i<members.length; i++) {
            if (members[i].id === $scope.current_person.id) {
              $scope.is_admin   = members[i].is_admin;
              $scope.is_spender = members[i].is_spender;
              $scope.is_public  = members[i].is_public;
              break;
            }
          }
        }

        // explicitly set to false if the logged in user is not part of the team
        $scope.is_admin   = $scope.is_admin || false;
        $scope.is_spender = $scope.is_spender || false;
        $scope.is_public  = $scope.is_public || false;
      });

      return members;
    });
  });
