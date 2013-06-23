'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/settings/email', {
        templateUrl: 'pages/settings/email.html',
        controller: 'Settings',
        resolve: $person
      });
  })
  .controller('Settings', function($scope, $routeParams, $api) {
    console.log('hax', $scope, $routeParams, $api);
  });

