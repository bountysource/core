'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/activity/pledges', {
        templateUrl: 'pages/activity/pledges.html',
        controller: 'PledgeActivity'
      });
  })
  .controller('PledgeActivity', function($scope, $routeParams, $api) {
    $scope.$watch("current_person", function() {
      if ($scope.current_person) {
        $scope.pledges = $api.pledge_activity();
      }
    });
  });

