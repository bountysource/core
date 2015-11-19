angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/transactions/:id/edit', {
    templateUrl: 'admin/transactions/edit.html',
    controller: "TransactionEdit"
  });
})
.controller("TransactionEdit", function ($scope, $window, $api, $routeParams, $location) {
  $scope.action = "edit";

  $scope.special = $api.special_accounts();
  $scope.generic = $api.generic_account_types();
  $scope.item_types = $api.item_types();
  $scope.transaction_types = $api.transaction_types();

  $api.get_transaction($routeParams.id).then(function(response) {
    if (response.meta.success)   {
      var transaction = response.data;
      $scope.transaction = response.data;

      $scope.transaction.fee = parseFloat($scope.transaction.fee);
      $scope.transaction.processing_fee = parseFloat($scope.transaction.processing_fee);
      $scope.transaction.gross = parseFloat($scope.transaction.gross);
      $scope.transaction.liability = parseFloat($scope.transaction.liability);

      $scope.form_data = angular.copy(transaction);
    } else {
      $scope.error = response.data.error;
    }
  });

  $scope.updateTransaction = function(form_data) {
    var data = angular.copy(form_data);
    var splits_array = data.splits;
    data.splits = {};
    for (var i = 0; i < splits_array.length; i++) {
      data.splits[i] = splits_array[i];
    }
    $api.update_transaction(data).then(function(response) {
      if (response.meta.success) {
        $location.url("/admin/transactions/" + form_data.id);
      } else {
        $scope.error = response.data.error;
      }
    });
  };
  
  $scope.addSplit = function() {
    $scope.form_data.splits.push({});
  };

  $scope.removeSplit = function(index) {
    if (confirm("Are you sure?")) {
      $scope.form_data.splits.splice(index, 1);
    }
  };

});
