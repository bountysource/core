'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jobs', {
        templateUrl: 'pages/about/jobs.html',
        controller: 'Static',
        title: 'Jobs'
      });
  });
