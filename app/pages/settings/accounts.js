'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/settings/accounts', {
        templateUrl: 'pages/settings/accounts.html',
        controller: 'AccountSettings',
        resolve: $person
      });
  })
  .controller('AccountSettings', function($scope, $api, $location) {
    $scope.set_post_auth_url = function() {
      $api.set_post_auth_url($location.url());
    };

    $scope.github_link = $api.signin_url_for('github');
    $scope.twitter_link = $api.signin_url_for('twitter');
    $scope.facebook_link = $api.signin_url_for('facebook');

    $scope.form_data = {};
    $scope.change_password = function() {
      $scope.error = $scope.success = null;

      var req = {
        current_password: $scope.form_data.current_password,
        new_password: $scope.form_data.new_password,
        password_confirmation: $scope.form_data.new_password
      };
      $api.change_password(req).then(function(response) {
        if (response.error) {
          $scope.error = response.error;
        } else {
          $scope.success = 'Successfully updated password!';
        }
      });
    };

  });

