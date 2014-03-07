'use strict';

angular.module('app')
  .config(function ($routeProvider, $person) {
    $routeProvider
      .when('/fundraisers/new', {
        templateUrl: 'pages/fundraisers/create.html',
        controller: 'FundraiserCreateController',
        resolve: $person
      });
  })

  .controller('FundraiserCreateController', function($scope, $routeParams, $location, $api) {
    $scope.fundraiser = {
      funding_goal: 25000,
      description: "",
      short_description: "",
      team_id: null
    };

    $scope.teams = $api.person_teams($scope.current_person.id);

    $scope.create = function() {
      $api.fundraiser_create($scope.fundraiser, function(response) {
        if (response.meta.success) {
          $location.url("/fundraisers/"+response.data.slug+"/edit");
        } else {
          $scope.error = response.data.error;
        }
      });
    };

    $scope.remaining_characters = 140;
    $scope.charactersLeft = function (description) {
      $scope.remaining_characters = 140 - description.length;
    };
  });
