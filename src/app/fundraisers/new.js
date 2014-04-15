'use strict';

angular.module('fundraisers').controller('FundraiserCreateController', function($scope, $routeParams, $location, $api, $analytics) {
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
      // Get person's teams
      $api.person_teams_get(person.id).then(function(teams) {
        $scope.teams = angular.copy(teams);

        //enter blank placeholder for team/new card only if they already have teams
        if($scope.teams.length > 0) {
          $scope.teams.unshift({ dummy: true});
        } else {
          $location.search({creating_fundraiser: true});
        }
      });
    }
  });

  // Watch Fundraiser object for Team. Fetch members if they are not present on the object.
  $scope.$watch('fundraiser.team', function(team) {
    if (team && !team.members) {
      $api.team_members_get(team.slug).then(function(members) {
        $scope.fundraiser.team.members = angular.copy(members);
        return members;
      });
    }
  });

  $scope.$watch('team_promise', function (team_promise) {
    if(team_promise) {
      $scope.team_promise.then(function (team) {
        $scope.create = function() {
          var payload = angular.copy($scope.fundraiser);
          payload.team_id = team.id;
          $api.fundraiser_create(payload, function(response) {
            if (response.meta.success) {
              // Mixpanel track event
              $analytics.createFundraiser(response.data.team.id);
              $location.url("/teams/"+response.data.team.slug+"/fundraisers/"+response.data.slug+"/edit").search( { rewards_edit: true } );
            } else {
              $scope.error = response.data.error;
            }
          });
        };
      });
    }
  });
});
