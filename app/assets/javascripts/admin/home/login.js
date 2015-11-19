'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/login', {
        templateUrl: 'admin/home/login.html',
        controller: 'AdminLoginCtrl'
      });
  })
  .controller('AdminLoginCtrl', function ($scope, $window, $api) {

    $scope.signin = function() {
      $api.signin($scope.form_data).then(function(response) {
        if (response.error) {
            $scope.error = true;
          }
      });
    };

  });

