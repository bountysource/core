'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/settings', {
        templateUrl: 'pages/settings/index.html',
        controller: 'Settings'
      });
  })
  .controller('Settings', function($scope, $routeParams, $api) {
  });

