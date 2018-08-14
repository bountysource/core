angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
    .when('/admin/ad_spaces/new', {
      templateUrl: 'admin/ad_spaces/new.html',
      controller: "NewAdSpaces"
    });
})
.controller("NewAdSpaces", function ($scope, $api, $location) {
  $scope.form_data = {};

  
  $scope.createAdSpace = function(form_data) {
    var data = angular.copy(form_data);
    if(data.position === ""){ data.position = null; }
    $api.create_ad_space(data).then(function(response) {
      if (response.meta.success) {
        $location.path("/admin/ad_spaces");
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});
