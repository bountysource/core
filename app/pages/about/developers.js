'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/faq/developers', {
        templateUrl: 'pages/about/developers.html',
        controller: 'Static'
      });
  });
