angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.session.reset', {
    url: "/signin/reset?access_token&code&email",
    title: "Password Reset ",
    templateUrl: "salt/session/reset.html",
    controller: function($scope, $state, $stateParams, $api, $auth) {
      $scope.form_data = {
          email: $state.params.email,
          code: $state.params.code
      };

      $scope.reset = function() {
        $scope.error = null;

        if ($scope.form.$valid) {
          $api.people.reset_password($scope.form_data, function(response) {
            $api.people.login({ email: $scope.form_data.email, password: $scope.form_data.new_password }, function(response) {
              $auth.setAccessToken(response.access_token);
              $auth.gotoTargetState();
            }, function (response) {
              $scope.error = response.data.error;
            });
          }, function(response){
            $scope.error = response.data.error || response.data.message;
          });
        }
      };
    },

  });
});
