angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/accounts/:id', {
    templateUrl: 'admin/accounts/show.html',
    controller: "AccountsShow"
  });
})
.controller("AccountsShow", function ($routeParams, $location, $scope, $api) {
  
  $api.get_account($routeParams.id).then(function(response) {
    if (response.meta.success) {
      $scope.account = response.data;
      $scope.splits = response.data.splits;
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
});
