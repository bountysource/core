'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/fundraisers', {
        templateUrl: 'pages/activity/fundraisers.html',
        controller: 'FundraiserActivity',
        resolve: $person,
        title: 'Bountysource - Fundraisers'
      });
  })
  .controller('FundraiserActivity', function($scope, $routeParams, $api) {
    $scope.fundraisers = $api.fundraiser_activity();
  });

