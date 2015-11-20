angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/follows', {
    templateUrl: 'admin/follows/index.html',
    controller: "Follows"
  });
})
.controller("Follows", function ($scope, $window, $api) {
  var params = {per_page: 50};
  //imitating current admin page.. probably should add pagination and sorting
  $scope.follows = $api.get_follows(params).then(function(response) {
    if (response.meta.success) {
      return response.data;
    } else {
      return response.data.error;
    }
  });
});
