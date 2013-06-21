'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/settings', {
        templateUrl: 'pages/settings/profile.html',
        controller: 'Settings'
      });
  })
  .controller('Settings', function($scope, $routeParams, $api) {
    console.log('hax', $scope, $routeParams, $api);
  });

