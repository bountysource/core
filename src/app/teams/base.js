'use strict';

angular.module('app').controller('BaseTeamController', function($scope, $location, $routeParams, $api, $pageTitle, $rootScope) {
  $pageTitle.set("Teams");

  $scope.team_promise = $api.v2.team($routeParams.id).then(function(response) {
    if(team.error) {
      $scope.error = team.error;
    } else {
      $scope.team = angular.copy(response.data);
      $pageTitle.set($scope.team.name, "Teams");

      $api.v2.trackers({ team_id: $scope.team.id, include_owner: true }).then(function(response) {
        $scope.setRelatedTrackers($scope.team, response.data);
      });
    }

    return $scope.team;
  });

  $scope.setRelatedTrackers = function(team, trackers) {
    console.log(trackers);
    $scope.ownedTrackers = [];
    $scope.usedTrackers = [];

    // set owned flag for all trackers
    for (var i=0; i<trackers.length; i++) {
      trackers[i].$owned = trackers[i].owner && (/^Team(?:::.*)*$/).test(trackers[i].owner.type) && trackers[i].owner.id === team.id;

      if (trackers[i].$owned) {
        $scope.ownedTrackers.push( angular.copy(trackers[i]) );
      } else {
        $scope.usedTrackers.push( angular.copy(trackers[i]) );
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
