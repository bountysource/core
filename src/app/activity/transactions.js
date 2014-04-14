'use strict';

angular.module('activity')
  .controller('TransactionsController', function($scope, $routeParams, $api) {
    $api.transaction_activity().then(function(transactions) {
      $scope.transactions = transactions;
      return transactions;
    });
  });
