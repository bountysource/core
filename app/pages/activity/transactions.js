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

    $api.transaction_activity().then(function(transactions) {
      $scope.transactions = transactions;
      return transactions;
    });
  });

