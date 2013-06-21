'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/settings/email', {
        templateUrl: 'pages/settings/email.html',
        controller: 'Settings'
      });
  })
  .controller('Settings', function($scope, $routeParams, $api) {
    console.log('hax', $scope, $routeParams, $api);
  });

