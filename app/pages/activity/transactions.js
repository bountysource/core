'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/activity/transactions', {
        templateUrl: 'pages/activity/transactions.html',
        controller: 'TransactionActivity',
        resolve: $person
      });
  })
  .controller('TransactionActivity', function($scope, $routeParams, $api) {
    $scope.resolved = false;

    $scope.transactions_promise = $api.call("/transactions").then(function(transactions) {
      $scope.resolved = true;

      $scope.transactions = transactions;
      return transactions;
    });
  });

