'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/teams/new', {
        templateUrl: 'pages/teams/new.html',
        controller: 'NewTeamController',
        resolve: $person,
        title: 'Create New Team'
      });
  })
  .controller('NewTeamController', function ($scope, $location, $api) {
    $scope.form_data = {};

    $scope.create_team = function () {
      $api.team_create($scope.form_data).then(function(team) {
        if (team.error) {
          $scope.error = team.error;
        } else {
          $location.url("/teams/"+team.slug);
        }
      });
    };

    $scope.slugify = function(text) {
      return (text||"").toLowerCase().replace(/[ ]+/g,'-').replace(/[,.]/g,'').replace(/-(inc|llc)$/,'');
    };

    $scope.$watch('form_data.name', function() {
      $scope.form_data.slug = $scope.slugify($scope.form_data.name);
    });
  });
