angular.module('app').controller('VerifyEmailController', function ($scope, $routeParams, $api) {
  $scope.params_data = {
    email: $routeParams.email,
    code: $routeParams.code
  };

  $scope.errors = null;
  $scope.success = null;

  $scope.email_change_verify = function() {
    $api.email_change_verify($scope.params_data).then(function(response) {
      if (response.message === 'Email changed') {
        $scope.success = true;
        $api.set_current_person();
      } else {
        $scope.errors = response.errors || response.message;
      }
    });
  };

  $scope.email_change_verify();
});
