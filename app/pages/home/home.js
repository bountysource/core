'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl',
        resolve: {
          count: function($rootScope, $api) {
            $rootScope.people_count = $api.people_count();
          }
        }
      });
  })
  .controller('HomeCtrl', function ($scope, $window, $api) {
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
