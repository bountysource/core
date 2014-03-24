'use strict';

angular.module('app').controller('BaseTeamController', function($scope, $location, $routeParams, $api, $pageTitle, $rootScope) {
  $pageTitle.set("Teams");

  $scope.team_promise = $api.team_get($routeParams.id).then(function(team) {
    $pageTitle.set(team.name, "Teams");

    $scope.team = angular.copy(team);
    $scope.setRelatedTrackers($scope.team);

    return $scope.team;
  });

  $scope.setRelatedTrackers = function(team) {
    $scope.ownedTrackers = [];
    $scope.usedTrackers = [];

    // set owned flag for all trackers
    for (var i=0; i<team.trackers.length; i++) {
      team.trackers[i].$owned = team.trackers[i].owner && (/^Team(?:::.*)*$/).test(team.trackers[i].owner.type) && team.trackers[i].owner.id === team.id;

      if (team.trackers[i].$owned) {
        $scope.ownedTrackers.push( angular.copy(team.trackers[i]) );
      } else {
        $scope.usedTrackers.push( angular.copy(team.trackers[i]) );
      }
    }

    return team;
  };

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
    });
    $scope.members = angular.copy(members);
    return $scope.members;
  });
});
