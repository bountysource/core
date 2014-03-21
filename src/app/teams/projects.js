'use strict';

angular.module('teams').controller('TeamProjectsController', function($scope) {

  $scope.team_promise.then(function(team) {
    $scope.ownedTrackers = [];
    $scope.usedTrackers = [];

    for (var i=0; i<team.trackers.length; i++) {
      team.trackers[i].$owned = team.trackers[i].owner && (/^Team(?:::.*)*$/).test(team.trackers[i].owner.type) && team.trackers[i].owner.id === team.id;

      if (team.trackers[i].$owned) {
        $scope.ownedTrackers.push( angular.copy(team.trackers[i]) );
      } else {
        $scope.usedTrackers.push( angular.copy(team.trackers[i]) );
      }
    }

    return team;
  });

});
