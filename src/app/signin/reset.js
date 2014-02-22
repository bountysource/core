'use strict';

angular.module('app').controller('Reset', function ($scope, $routeParams, $api) {
  $scope.form_data = {
    email: $routeParams.email,
    code: $routeParams.code
  };

  $scope.reset_password = function() {
    $scope.show_validations = true;
    $scope.error = null;

    if ($scope.form.$valid) {
      $api.reset_password($scope.form_data).then(function(response) {
        if (response.message === 'Password reset') {
          $api.signin({ email: $scope.form_data.email, password: $scope.form_data.new_password });
        } else {
          $scope.error = response.error || response.message;
        }
      });
    }
  };
});
