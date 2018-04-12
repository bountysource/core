angular.module('app').controller('BaseTeamController', function($scope, $location, $routeParams, $api, $pageTitle, Team, Tracker) {
  $scope.team_promise = $api.v2.team($routeParams.id).then(function(response) {
    if (!response.success) {
      $scope.no_team_error = response.data.error;
    } else {
      $scope.team = new Team(angular.copy(response.data));
      
      // update URL if uppercase/lowercase is off
      if ($scope.team.slug !== $routeParams.id) {
        $location.url($location.url().replace("/teams/"+ $routeParams.id, "/teams/"+ $scope.team.slug)).replace();
      }

      // Parse ints back into strings
      $scope.team.open_bounties_amount = parseInt($scope.team.open_bounties_amount, 10);
      $scope.team.closed_bounties_amount = parseInt($scope.team.closed_bounties_amount, 10);

      $pageTitle.set($scope.team.name, 'Bountysource');
    }

    return $scope.team;
  });

  $scope.set_team = function(new_team) {
    // Support v1/v2 response for team attributes; Add v1 attributes on original v2 team object
    for (var k in new_team) {
      $scope.team[k] = new_team[k];
    }
  };

  /*****************************
   * Team Members
   * */

  $scope.members_promise = $api.team_members_get($routeParams.id).then(function(members) {
    $scope.$watch('current_person', function(person) {
      if (person) {
        for (var i=0; i<members.length; i++) {
          if (members[i].id === person.id) {
            $scope.is_member  = true;
            $scope.is_admin   = members[i].is_admin;
            $scope.is_developer = members[i].is_developer;
            $scope.is_public  = members[i].is_public;
            $scope.has_remaining_balance = members[i].balance;
            break;
          }
        }
      }

      // explicitly set to false if the logged in user is not part of the team
      $scope.is_member  = $scope.is_member || false;
      $scope.is_admin   = $scope.is_admin || false;
      $scope.is_developer = $scope.is_developer || false;
      $scope.is_public  = $scope.is_public || false;
    });
    $scope.members = angular.copy(members);
    return $scope.members;
  });
});
