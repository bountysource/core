'use strict';

angular.module('app')
  .config(function ($routeProvider, personResolver) {
    $routeProvider
      .when('/activity/transactions', {
        templateUrl: 'pages/activity/transactions.html',
        controller: 'TransactionActivity',
        resolve: {
          person: personResolver
        }
      });
  })
  .controller('TransactionActivity', function($scope, $routeParams, $api) {
    $scope.resolved = false;

    $api.transaction_activity().then(function(transactions) {
      $scope.transactions = transactions;
      return transactions;
    });
  });

