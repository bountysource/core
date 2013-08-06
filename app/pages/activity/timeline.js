'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity', {
        templateUrl: 'pages/activity/timeline.html',
        controller: 'Activity',
        resolve: $person,
        title: 'Bountysource - Timeline'
      });
  })
  .controller('Activity', function($scope, $routeParams, $api) {
    console.log("whee activity controller");
    $scope.timeline = $api.person_timeline_get($scope.current_person.id);
  });

