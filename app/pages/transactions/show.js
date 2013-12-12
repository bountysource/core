'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/transactions/:id', {
        templateUrl: 'pages/transactions/show.html',
        controller: 'TransactionsController',
        resolve: $person
      });
  })
  .controller('TransactionsController', function ($scope, $routeParams, $api) {
    $scope.transaction_promise = $api.call("/transactions/"+$routeParams.id).then(function(transaction) {
      console.log(transaction);

      $scope.transaction = transaction;
      return transaction;
    });
  });

