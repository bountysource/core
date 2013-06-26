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

  });

