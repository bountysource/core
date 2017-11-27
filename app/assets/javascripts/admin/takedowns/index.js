angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/takedowns', {
        templateUrl: 'admin/takedowns/index.html',
        controller: "Takedowns"
      });
  })
  .controller("Takedowns", function ($scope, $window, $api) {
    $scope.form_data = {};
    $scope.error = null;

    $scope.update_page = function() {
      $scope.takedowns = [];

      $api.get_takedowns().then(function(response) {
        $scope.takedowns = response;
      });
    };

    $scope.update_page();

    $scope.create_takedown = function() {
      $api.create_takedown($scope.form_data).then(function(response) {
        if (response.error) {
          $scope.error = response.error;
        } else {
          $scope.error = null;
          $scope.update_page();
        }
      });
    };
  });
