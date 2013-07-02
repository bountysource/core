'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/faq/backers', {
        templateUrl: 'pages/about/backers.html',
        controller: 'Static'
      });
  });
