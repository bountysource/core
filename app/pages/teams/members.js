'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/:id/members', {
        templateUrl: 'pages/teams/members.html',
        controller: 'BaseTeamController'
      });
  });