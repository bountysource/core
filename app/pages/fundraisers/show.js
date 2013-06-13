'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraisersController'
      });
  })

  .controller('FundraisersController', function ($scope, $routeParams, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id).then(function(response) {
      console.log('fundraiser', response);
      return response;
    });

    $scope.pledges = $api.fundraiser_pledges_get($routeParams.id).then(function(response) {
      console.log('pledges', response);
      return response;
    });
  });
