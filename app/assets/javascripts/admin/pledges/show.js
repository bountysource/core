angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/pledges/:id', {
    templateUrl: 'admin/pledges/show.html',
    controller: "PledgesShow"
  });
})
.controller("PledgesShow", function ($routeParams, $scope, $window, $api) {
  $api.get_pledge($routeParams.id).then(function(response) {
    if (response.meta.success) {
      $scope.pledge = response.data; 
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

});
