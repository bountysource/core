'use strict';

angular.module('app').controller('BaseTeamController', function($scope, $location, $routeParams, $api, $pageTitle, $rootScope) {
  $pageTitle.set("Teams");

  $scope.team_promise = $api.v2.team($routeParams.id).then(function(response) {
    if (!response.success) {
      $scope.no_team_error = response.data.error;
    } else {
      $scope.team = angular.copy(response.data);

      // Parse ints back into strings
      $scope.team.open_bounties_amount = parseInt($scope.team.open_bounties_amount, 10);
      $scope.team.closed_bounties_amount = parseInt($scope.team.closed_bounties_amount, 10);

      $pageTitle.set($scope.team.name, "Teams");

      $api.v2.trackers({ team_id: $scope.team.id, include_owner: true }).then(function(response) {
        $scope.setRelatedTrackers($scope.team, response.data);
      });
    }

    return $scope.team;
  });

  $scope.setRelatedTrackers = function(team, trackers) {
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
 
  $scope.set_team = function(new_team) {
    // Support v1/v2 response for team attributes; Add v1 attributes on original v2 team object
    for (var k in new_team) {
      $scope.team[k] = new_team[k];
    }
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
