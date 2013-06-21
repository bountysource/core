'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/settings/accounts', {
        templateUrl: 'pages/settings/accounts.html',
        controller: 'AccountSettings'
      });
  })
  .controller('AccountSettings', function($scope, $routeParams, $api) {
  });

