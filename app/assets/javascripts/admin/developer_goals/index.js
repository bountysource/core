angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
  .when('/admin/developer_goals', {
    templateUrl: 'admin/developer_goals/index.html',
    controller: "DeveloperGoalsIndexController"
  });
})
.controller("DeveloperGoalsIndexController", function ($scope, $window, $api) {

  $api.get_developer_goals().then(function (response) {
    if (response.meta.success) {
      $scope.developer_goals = response.data;
    } else {
      $scope.error = response.data;
    }
  });

});
