'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/enterprise', {
        templateUrl: 'pages/enterprise/index.html',
        trackEvent: 'View Enterprise'
      });
  });
