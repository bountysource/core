'use strict';

angular.module('app').controller('TransactionActivity', function($scope, $routeParams, $api) {
  $scope.resolved = false;

  $api.transaction_activity().then(function(transactions) {
    $scope.transactions = transactions;
    return transactions;
  });
});
