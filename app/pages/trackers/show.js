'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/trackers/:id', {
        templateUrl: 'pages/trackers/show.html',
        controller: 'TrackerShow'
      });
  })
  .controller('TrackerShow', function ($scope, $routeParams, $api) {
    $scope.tracker = $api.tracker_get($routeParams.id);
  });

