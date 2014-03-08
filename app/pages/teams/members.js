'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teams/:id/members', {
        templateUrl: 'pages/teams/members.html',
        controller: 'BaseTeamController',
        trackEvent: 'View Team Members'
      });
  });