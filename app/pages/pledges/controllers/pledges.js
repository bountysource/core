'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/pledges', {
        templateUrl: 'pages/pledges/index.html',
        controller: 'FundraiserPledgeController'
      });
  })

  .controller('FundraiserPledgeController', function ($scope, $routeParams, $api) {
    $scope.pledges = $api.fundraiser_pledges_get($routeParams.id).then(function(r) {
      console.log('pledges', r);
      return r;
    });
  });
