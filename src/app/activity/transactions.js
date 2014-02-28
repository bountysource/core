'use strict';

angular.module('app').controller('TransactionActivity', function($scope, $routeParams, $api) {
  $scope.resolved = false;

  $api.transaction_activity().then(function(transactions) {
    $scope.resolved = true;
    $scope.transactions = transactions;
    return transactions;
  });
});
