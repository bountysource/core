'use strict';

angular.module('app.controllers').controller('FundraiserCreateController', ['$scope', '$routeParams', '$location', '$api', function($scope, $routeParams, $location, $api) {
  $scope.fundraiser = {
    funding_goal: 25000,
    description: "",
    short_description: "",
    team_id: null
  };

  $api.person_teams($scope.current_person.id).then(function(teams) {
    $scope.teams = teams;
    return teams;
  });

  $scope.create = function() {
    $api.fundraiser_create($scope.fundraiser, function(response) {
      if (response.meta.success) {
        $location.url("/fundraisers/"+response.data.slug+"/edit");
      } else {
        $scope.error = response.data.error;
      }
    });
  };
}]);
