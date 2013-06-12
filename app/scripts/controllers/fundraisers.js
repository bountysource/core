'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers', {
        templateUrl: 'views/fundraisers/index.html',
        controller: 'FundraisersCtrl'
      })
      .when('/fundraisers/:id', {
        templateUrl: 'views/fundraisers/show.html',
        controller: 'FundraisersCtrl'
      });
  })
  .controller('FundraisersCtrl', function ($scope, $routeParams, $api) {
    $scope.fundraiser = $api.fundraiser.find($routeParams.id);
  });

