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
  .controller('AccountSettings', function($scope) {
    $scope.accounts = [
      $scope.current_person.github_account,
      $scope.current_person.facebook_account,
      $scope.current_person.twitter_account
    ];
  });

