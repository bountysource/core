'use strict';

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
      }
    }
  });
});
