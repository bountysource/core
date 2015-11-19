'use strict';

angular.module('app').controller('EditTeamController', function ($scope, $routeParams, $location, Team) {

  $scope.form_data = {};
  $scope.claimThisTeam = function() {
    Team.update({ slug: $routeParams.id, claim: true, notes: $scope.form_data.notes }, function(response) {
      if (response.claim === 'pending') {
        $scope.teamClaimed = true;
      } else if (response.claim === 'success') {
        $location.url('/teams/' + $scope.team.slug);
      }
    });
  };
});
