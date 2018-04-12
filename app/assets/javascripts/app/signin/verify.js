angular.module('app').controller('VerifyController', function ($scope, $routeParams, $api) {
  $scope.params_data = {
    email: $routeParams.email,
    code: $routeParams.code
  };

  $scope.error = null;
  $scope.success = null;

  $scope.email_verify = function() {
    $api.email_verify($scope.params_data).then(function(response) {
      if (response.message === 'Verify') {
        $scope.success = true;
        $api.set_current_person();
      } else {
        $scope.error = response.error || response.message;
      }
    });
  };

  $scope.email_verify();
});
