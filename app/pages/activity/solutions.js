'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/activity/solutions', {
        templateUrl: 'pages/activity/solutions.html',
        controller: 'SolutionActivity'
      });
  })
  .controller('SolutionActivity', function($scope, $routeParams, $api) {
    $scope.$watch("current_person", function() {
      if ($scope.current_person) {
        $scope.solutions = $api.solution_activity();
      }
    });
  });

