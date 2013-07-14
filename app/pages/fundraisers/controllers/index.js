'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers', {
        templateUrl: 'pages/fundraisers/index.html',
        controller: 'FundraisersIndex'
      });
  })
  .controller('FundraisersIndex', function ($scope, $routeParams, $api) {
    $scope.fundraiser = $api.fundraiser.find($routeParams.id);
  });

