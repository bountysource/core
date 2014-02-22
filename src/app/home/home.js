'use strict';

angular.module('app').controller('HomeCtrl', function ($scope, $window, $api) {
  $api.fundraiser_cards().then(function(fundraisers) {
    $scope.fundraisers = fundraisers;
    return fundraisers;
  });

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
