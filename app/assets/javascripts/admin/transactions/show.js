'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/transactions/:id', {
    templateUrl: 'admin/transactions/show.html',
    controller: "TransactionShow"
  });
})
.controller("TransactionShow", function ($scope, $window, $api, $location, $routeParams) {

  $api.get_transaction($routeParams.id).then(function(response) {
    if (response.meta.success) {
      $scope.transaction = response.data;
    } else {
      $scope.error = response.data.error;
    }
  });

  $scope.itemLink = function(split) {
    if (!split || !split.item_type) { return ""; }
    var plural = split.item_type.toLowerCase().replace(/y$/, "ie") + 's';
    plural.replace(/persons/, 'people');

    if (split && split.item_type) {
      return "/admin/" + plural + "/" + split.item_id;
    }
  };

  $scope.accountLink = function(account) {
    if (account) {
      return account.id + " ("+account.type+")" + (account.balance ? " $"+account.balance : null);
    } else {
      return "(none)";
    }
  };

  $scope.confirmDelete = function() {
    if (confirm('Delete transaction #' + $scope.transaction.id + ' and all splits?')) {
      $api.delete_transaction($scope.transaction.id).then(function(response) {
        if (response.meta.success) {
          $location.url('/admin/transactions');
        } else {
          $scope.error = response.data.error;
        }
      });
    }
  };
});
