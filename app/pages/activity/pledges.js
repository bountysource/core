'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/pledges', {
        templateUrl: 'pages/activity/pledges.html',
        controller: 'PledgeActivity',
        resolve: $person
      });
  })
  .controller('PledgeActivity', function($scope, $routeParams, $api) {
    $scope.pledges = $api.pledge_activity();
  });

