'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl'
      });
  })
  .controller('HomeCtrl', function ($scope, $window, $api) {
    $scope.fundraisers = $api.fundraiser_cards();

    // $scope.recent_people = $api.people_recent();
    $api.people_interesting().then(function(people) {
      $scope.people = people;
    });

    $scope.trackers = $api.project_cards().then(function(trackers) {
      for (var i=0; i<trackers.length; i++) {
        trackers[i].bounty_total = parseFloat(trackers[i].bounty_total);
      }
      return trackers;
    });

  });
