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

function AlertDemoCtrl($scope) {
  $scope.alerts = [
    { type: 'error', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
  ];

  $scope.addAlert = function() {
    $scope.alerts.push({msg: "Another alert!"});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

}