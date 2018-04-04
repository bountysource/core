angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.session.password_reset', {
    url: "/password_reset",
    title: "Password Reset",
    templateUrl: "salt/session/password_reset.html",
    controller: function($scope, $state, $api, $auth, person) {
      $scope.form_data = {};
      $scope.request_password_reset = function() {
        $scope.error = null;
        $api.people.request_password_reset($scope.form_data, function(response) {
          $scope.error = response.message;
        }, function(response) {
          $scope.error = response.data.error;
        });
      };
    }
  });
});
