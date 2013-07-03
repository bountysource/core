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
      console.log(people);
      $scope.people = people;
    });

    $scope.trackers = $api.project_cards();

    $window.twttr.widgets.load();
  });
