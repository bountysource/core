'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/faq', {
        templateUrl: 'pages/about/faq.html',
        controller: 'Static'
      });
  });
