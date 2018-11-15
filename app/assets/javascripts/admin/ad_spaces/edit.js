angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
    .when('/admin/ad_spaces/:id/edit', {
      templateUrl: 'admin/ad_spaces/edit.html',
      controller: "EditAdSpaces"
    });
})
.controller("EditAdSpaces", function ($scope, $api, $routeParams, $location) {
  $scope.form_data = {};

  $api.get_ad_space($routeParams.id).then(function(response) {
    if (response.meta.success)   {
      var adSpace = response.data;
      $scope.adSpace = response.data;

      $scope.form_data = angular.copy(adSpace);
    } else {
      $scope.error = response.data.error;
    }
  });

  $scope.updateAdSpace = function(form_data) {
    var data = angular.copy(form_data);
    if(data.position === ""){ data.position = null; }
    $api.update_ad_space(data).then(function(response) {
      if (response.meta.success) {
        $location.path("/admin/ad_spaces");
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});



