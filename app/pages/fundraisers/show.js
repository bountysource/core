'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraisersShow'
      });
  })
  .controller('FundraisersShow', function ($scope, $routeParams, $api) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);
  });

