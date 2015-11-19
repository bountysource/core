'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/transactions/new', {
    templateUrl: 'admin/transactions/new.html',
    controller: "NewTransactions"
  });
})
.controller("NewTransactions", function ($location, $scope, $api) {
  $scope.action = 'create';
  
  $scope.special = $api.special_accounts();
  $scope.generic = $api.generic_account_types();
  $scope.transaction_types = $api.transaction_types();
  $scope.item_types = $api.item_types();

  $scope.form_data = {};
  $scope.form_data.splits = [];


  $scope.addSplit = function() {
    $scope.form_data.splits.push({});
  };

  $scope.removeSplit = function(index) {
    if (confirm("Are you sure?")) {
      $scope.form_data.splits.splice(index, 1);
    }
  };

  $scope.createTransaction = function(form_data) {
    var data = angular.copy(form_data);
    var splits_array = data.splits;
    data.splits = {};
    for (var i = 0; i < splits_array.length; i++) {
      data.splits[i] = splits_array[i];
    }
    $api.create_transaction(data).then(function(response) {
      if (response.meta.success) {
        $location.path("/admin/transactions/" + response.data.id);
      } else {
        $scope.error = response.data.error;
      }
    });
  };

});
