'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity', {
        templateUrl: 'pages/activity/timeline.html',
        controller: 'Activity',
        resolve: $person,
        trackEvent: 'View My Timeline'
      });
  })
  .controller('Activity', function($scope, $routeParams, $api, $pageTitle) {
    $pageTitle.set('Timeline', 'Activity');

    $scope.timeline = $api.person_activity($scope.current_person.id);
  });

