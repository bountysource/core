'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/issues/:id/comments', {
        templateUrl: 'pages/issues/comments.html',
        controller: 'IssueCommentsController'
      });
  })

  .controller('IssueCommentsController', function ($scope, $routeParams, $api) {
    console.log($scope, $routeParams, $api);
  });

