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
  .controller('NewTeamController', function ($scope, $location, $api, $filter, $routeParams) {
    $scope.team_options = [
      {param: "project", label: "Open Source Project", value: "Team::Project"},
      {param: "startup", label: "Startup", value: "Team::Startup"},
      {param: "enterprise", label: "Enterprise", value: "Team::Enterprise"},
    ];

    $scope.form_data = {};

    //set the default team type through route params
    if ($routeParams.type) {
      for (var i = 0; i < $scope.team_options.length; i++) {
        if ($routeParams.type === $scope.team_options[i].param) {
          $scope.form_data.type = $scope.team_options[i].value;
        }
      }
    } else {
      //if none is specified, default to Project
      $scope.form_data.type = "Team::Project";
    }

    $scope.$watch('form_data.name', function() {
      $scope.form_data.slug = $filter('slug')($scope.form_data.name);
    });

    $scope.create_team = function () {
      $api.team_create($scope.form_data).then(function(team) {
        if (team.error) {
          $scope.error = team.error;
        } else {
          $location.url("/teams/"+team.slug+"/members/manage");
        }
      });
    };
  });
