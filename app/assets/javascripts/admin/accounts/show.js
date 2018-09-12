angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/accounts/:id', {
    templateUrl: 'admin/accounts/show.html',
    controller: "AccountsShow"
  });
})
.controller("AccountsShow", function ($routeParams, $location, $scope, $api) {
  $scope.form_data = {
    account_id: $routeParams.id
  };
  $api.get_account($routeParams.id).then(function(response) {
    if (response.meta.success) {
      $scope.account = response.data;
      $scope.splits = response.data.splits;
      $scope.form_data.overrideFeePercentage = response.data.override_fee_percentage;
    }
  });

  $scope.itemLink = function(split) {
    if (!split || !split.item_type) { return ""; }
    var plural = split.item_type.toLowerCase().replace(/y$/, "ie") + 's';
    plural = plural.replace(/persons/, 'people');

    if (split && split.item_type) {
      return "/admin/" + plural + "/" + split.item_id;
    }
  };

  $scope.updateAccount = function(form_data) {
    $scope.error = null;
    $scope.success = null;
    var data = angular.copy(form_data);
    if(data.overrideFeePercentage === "") { 
      data.overrideFeePercentage = null;
    } else {
      data.override_fee_percentage = data.overrideFeePercentage;
    }
    $api.update_account(data).then(function(response){
      if (response.meta.success) {
        $scope.success = "Updated";
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});
