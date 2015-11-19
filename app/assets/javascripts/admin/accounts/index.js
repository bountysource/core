'use strict';

angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/accounts', {
    templateUrl: 'admin/accounts/index.html',
    controller: "Accounts"
  });
})
.controller("Accounts", function ($location, $scope, $api) {
  
  $scope.special_accounts = $api.special_accounts();

  $api.get_accounts().then(function(response) {
    if (response.meta.success) {
      $scope.accounts = response.data;
    } else {
      $scope.error = response.data.error;
    }
  });

});
