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
  .controller('AccountSettings', function($scope, $routeParams, $api) {
    console.log('hax', $scope, $routeParams, $api);
  });

