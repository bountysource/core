angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.session.login', {
    url: "/login",
    title: "Log In",
    templateUrl: "salt/session/login.html",
    controller: function($scope, $state, $api, $auth, person) {
      $scope.form_data = {};

      $scope.login = function() {
        $scope.error = null;
        $api.people.login($scope.form_data, function(response) {
          $auth.setAccessToken(response.access_token);
          $auth.gotoTargetState();
        }, function(response) {
          $scope.error = response.data.error;
        });
      };

      $scope.reset_password = function() {
        if(!$scope.form_data.email) {
          $scope.error = !!$scope.form.email.$viewValue ? "Email address invalid" : "Email address empty";
          return;
        }

        $api.people.registered({email: $scope.form_data.email}, function(response) {
          if(!response.registered) {
            $scope.error = "Email address not found";
            return;
          }

          $api.people.reset_password({email: $scope.form_data.email}, function(response) {
            $scope.error = response.message;
          })
        });
      };
    }
  });
});
