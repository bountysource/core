'use strict';

angular.module('fundraisers').controller('FundraiserCreateController', function($scope, $routeParams, $location, $api) {
  $scope.fundraiser = {
    total_pledged: 0,
    funding_goal: 25000,
    description: "",
    short_description: "",
    team_id: null,
    $days_left: 30
  };

  // Watch current person to add author to fundraiser side bar
  $scope.$watch('current_person', function(person) {
    if (person) {
      $scope.fundraiser.person = angular.copy(person);

      $api.person_teams(person.id).then(function(teams) {
        $scope.teams = teams;
        return teams;
      });
    }
  });

  $scope.create = function() {
    var payload = angular.copy($scope.fundraiser);

    // Replace Team object with Team id as team_id
    if (payload.team) {
      payload.team_id = payload.team.id;
      delete payload.team;
    }

    $api.fundraiser_create(payload, function(response) {
      if (response.meta.success) {
        $location.url("/fundraisers/"+response.data.slug+"/edit");
      } else {
        $scope.error = response.data.error;
      }
    });
  };
});
