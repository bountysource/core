'use strict';

angular.module('app')
  .config(function($routeProvider, $person) {
    $routeProvider
    .when('/suchwowdashboard', {
      template_url: 'pages/dash/dash.html',
      controller: 'Dash',
      title: 'User Dashboard',
      resolve: $person
  });
})

.controller('Dash', function($scope, $location, $api) {
  console.log('wow');
});
