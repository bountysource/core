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
    $scope.fundraisers = $api.fundraiser_cards();

    $scope.people = $api.people_interesting();

    $scope.trackers = $api.project_cards().then(function(trackers) {
      for (var i=0; i<trackers.length; i++) {
        trackers[i].bounty_total = parseFloat(trackers[i].bounty_total);
      }
      return trackers;
    });
  });
