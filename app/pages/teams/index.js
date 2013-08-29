'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teams', {
        templateUrl: 'pages/teams/index.html',
        controller: 'TeamsIndexController',
        title: 'Teams'
      });
  })
  .controller('TeamsIndexController', function ($scope, $location, $api) {
    $scope.teams = $api.list_teams();
  });
