'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledges', {
        templateUrl: 'pages/fundraisers/pledges/index.html',
        controller: 'FundraiserPledgesController'
      });
  })

  .controller('FundraiserPledgesController', function ($scope, $routeParams, $api) {
    $scope.pledges = $api.fundraiser_pledges_get($routeParams.id).then(function(r) {
      console.log('pledges', r);

      // calculate percentage bar
      $scope.funding_percentage = Math.min(r.total_pledged / r.funding_goal, 100) * 100;

      return r;
    });
  });
