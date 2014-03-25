'use strict';

angular.module('app').controller('HomeCtrl', function ($scope, $window, $api) {

  $api.v2.fundraisers({
    featured: true,
    order: 'pledge_total',
    per_page: 5
  }).then(function(response) {
    $scope.fundraisers = angular.copy(response.data);

    // Calculate percentage of goal met
    for (var i=0; i<$scope.fundraisers.length; i++) {
      $scope.fundraisers[i].percentageOfGoalMet = 100 * $scope.fundraisers[i].total_pledged / $scope.fundraisers[i].funding_goal;
    }
  });

//  $api.fundraiser_cards().then(function(fundraisers) {
//    $scope.fundraisers = fundraisers;
//    return fundraisers;
//  });

  $api.people_interesting().then(function(people) {
    $scope.people = people;
    return people;
  });

  $api.project_cards().then(function(trackers) {
    $scope.trackers = trackers;
    for (var i=0; i<trackers.length; i++) {
      trackers[i].bounty_total = parseFloat(trackers[i].bounty_total);
    }

    return trackers;
  });
});
