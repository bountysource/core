'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/shorts', {
        templateUrl: 'admin/shorts/index.html',
        controller: "Shorts"
      });
  })
  .controller("Shorts", function ($scope, $window, $api) {

    var reload_shorts = function() {
      $scope.new_short = {};
      $scope.error = null;

      $api.get_shorts().then(function(response) {
        $scope.shorts = response;
      });
    };
    reload_shorts();

    $scope.create_short = function() {
      $api.create_short($scope.new_short).then(function(response) {
        if (response.meta.success) {
          reload_shorts();
        } else {
          $scope.error = response.data.error;
        }
      });
    };

  });
