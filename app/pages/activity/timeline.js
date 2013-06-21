'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/activity', {
        templateUrl: 'pages/activity/timeline.html',
        controller: 'Activity'
      });
  })
  .controller('Activity', function($scope, $routeParams, $api) {
    $scope.$watch("current_person", function() {
      if ($scope.current_person) {
        $scope.timeline = $api.person_timeline_get($scope.current_person.id);
      }
    });
  });

