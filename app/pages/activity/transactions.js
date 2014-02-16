'use strict';

angular.module('app.controllers').controller('TransactionActivity', ['$scope', '$routeParams', '$api', function($scope, $routeParams, $api) {
  $scope.resolved = false;

  $api.transaction_activity().then(function(transactions) {
    $scope.transactions = transactions;
    return transactions;
  });
}]);
