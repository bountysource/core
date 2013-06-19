'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id/updates', {
        templateUrl: 'pages/fundraisers/updates/index.html',
        controller: 'FundraiserUpdatesController'
      });
  })

  .controller('FundraiserUpdatesController', function ($scope, $routeParams, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      $scope.updates = response.updates;
      return response;
    });
  });
