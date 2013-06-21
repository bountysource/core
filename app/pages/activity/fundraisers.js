'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/activity/fundraisers', {
        templateUrl: 'pages/activity/fundraisers.html',
        controller: 'FundraiserActivity'
      });
  })
  .controller('FundraiserActivity', function($scope, $routeParams, $api) {
    $scope.$watch("current_person", function() {
      if ($scope.current_person) $scope.fundraisers = $api.fundraiser_activity();
    })
  });

