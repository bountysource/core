'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/learn', {
        templateUrl: 'pages/about/learn.html',
        controller: 'Static',
        title: 'Learn',
        trackEvent: 'View Learn'
      });
  });
