'use strict';

angular.module('app').controller('BaseTeamController', function($scope, $location, $routeParams, $api, $pageTitle, $rootScope) {
  $pageTitle.set("Teams");

  $scope.team_promise = $api.team_get($routeParams.id).then(function(team) {
    $pageTitle.set(team.name, "Teams");

    $scope.team = angular.copy(team);

    return $scope.team;
  });

  $scope.set_team = function(team) {
    $scope.team = team;
  };

  /*****************************
   * Team Members
   * */

  $scope.members_promise = $api.team_members_get($routeParams.id).then(function(members) {

    $scope.$watch('current_person', function(person) {
      if (person) {
        for (var i=0; i<members.length; i++) {
          if (members[i].id === person.id) {
            $scope.is_member  = true;
            $scope.is_admin   = members[i].is_admin;
            $scope.is_developer = members[i].is_developer;
            $scope.is_public  = members[i].is_public;
            $scope.has_remaining_balance = members[i].balance;
            break;
          }
        }
      }

      // explicitly set to false if the logged in user is not part of the team
      $scope.is_member  = $scope.is_member || false;
      $scope.is_admin   = $scope.is_admin || false;
      $scope.is_developer = $scope.is_developer || false;
      $scope.is_public  = $scope.is_public || false;

      // a little hacky: If you lack the permissions, or are not logged in on /projects, redirect to /
      if (!($scope.is_admin || $scope.is_developer) || person === false) {
        if ((/^\/teams\/[^\/]+\/projects$/).test($location.path())) {
          $location.path("/teams/"+$routeParams.id).replace();
        }
      }
    });

    $scope.members = angular.copy(members);
  });


  $scope.isTeamMember = function(team, person) {
    for (var i=0; $scope.members && i<$scope.members.length; i++) {
      if ($scope.members[i].id === person.id) {
        return true;
        break;
      }
    }
    return false;
  };

  $scope.isTeamAdmin = function(team, person) {
    for (var i=0; $scope.members && i<$scope.members.length; i++) {
      if ($scope.members[i].id === person.id) {
        return $scope.members[i].is_admin;
        break;
      }
    }
    return false;
  };

  $scope.isTeamDeveloper = function(team, person) {
    for (var i=0; $scope.members && i<$scope.members.length; i++) {
      if ($scope.members[i].id === person.id) {
        return true;
        return $scope.members[i].is_developer;
        break;
      }
    }
    return false;
  };

  $scope.isPublicTeamMember = function(team, person) {
    for (var i=0; $scope.members && i<$scope.members.length; i++) {
      if ($scope.members[i].id === person.id) {
        return $scope.members[i].is_public;
        break;
      }
    }
    return false;
  };

});
