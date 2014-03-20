'use strict';

angular.module('app')
  .controller('TeamFundraiserController', function($scope, $api) {

    // Load actve fundraiser once the Team is resolved
    $scope.team_promise.then(function(team) {
      if (team) {

        $api.v2.backers().then(function(response) {
          $scope.fundraisers = angular.copy(response.data);
        });

      }
    });

  });