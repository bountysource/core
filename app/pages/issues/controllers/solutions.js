'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/solutions', {
        templateUrl: 'pages/issues/solutions.html',
        controller: 'IssueSolutionsController'
      });
  })

  .controller('IssueSolutionsController', function ($scope, $routeParams, $api) {
    console.log($scope, $routeParams, $api);
  });

