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
  .controller('FundraisersCtrl', function ($scope) {
    $scope.title = "Awesome fundraiser";

    $scope.fundraiser = {
      id: 1,
      title: "Awesome!",
      body: "something awesome here"
    };

  });
