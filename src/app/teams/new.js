'use strict';

angular.module('app').controller('NewTeamController', function ($scope, $location, $api, $filter, $routeParams, $pageTitle) {
  console.log($routeParams.creating_fundraiser);
  $pageTitle.set("Teams", "New");

  $scope.team_options = [
    { param: "project", label: "Open Source Project", value: "Team::Project" },
    { param: "startup", label: "Startup", value: "Team::Startup" },
    { param: "enterprise", label: "Enterprise", value: "Team::Enterprise" }
  ];

  $scope.form_data = {
    type: "Team::Project"
  };

  $scope.creating_team = false;

  // set the default team type through route params
  if ($routeParams.type) {
    for (var i=0; i<$scope.team_options.length; i++) {
      if ($routeParams.type === $scope.team_options[i].param) {
        $scope.form_data.type = $scope.team_options[i].value;
        break;
      }
    }
  }

  $scope.$watch('form_data.name', function() {
    $scope.form_data.slug = $filter('slug')($scope.form_data.name);
  });

  $scope.create_team = function () {
    $scope.creating_team = true;

    $api.team_create($scope.form_data).then(function(team) {
      $scope.creating_team = false;

      if (team.error) {
        $scope.error = team.error;
      } else if ($routeParams.creating_fundraiser) {
        $location.url("/fundraisers/new");
      } else {
        $location.url("/teams/"+team.slug);
      }
    });
  };
});
