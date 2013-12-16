'use strict';

angular.module('app')
  .controller('BaseTeamController', function($scope, $location, $routeParams, $api, $pageTitle) {
    $pageTitle.set("Teams");

    $scope.team = $api.team_get($routeParams.id).then(function(team) {
      $pageTitle.set(team.name, "Teams");
      team = $scope.process_owned_unowned_trackers(team);
      return team;
    });

    $scope.process_owned_unowned_trackers = function(team) {
      team.owned_trackers = [];
      team.unowned_trackers = [];

      // set owned flag for all trackers
      for (var i=0; i<team.trackers.length; i++) {
        team.trackers[i].$owned = team.trackers[i].owner && (/^Team(?:::.*)*$/).test(team.trackers[i].owner.type) && team.trackers[i].owner.id === team.id;

        // push to owned_trackers or unowned_trackers
        (team.trackers[i].$owned ? team.owned_trackers : team.unowned_trackers).push(team.trackers[i]);
      }
      return team;
    };

    $scope.set_team = function(team) {
      $scope.team = team;
    };

    $scope.active_tab = function(tab) {
      if (tab === 'home' && (/^\/teams\/[^\/]+$/).test($location.path())) { return true; }
      else if (tab === 'members' && (/^\/teams\/[^\/]+\/members$/).test($location.path())) { return true; }
      else if (tab === 'activity' && (/^\/teams\/[^\/]+\/activity$/).test($location.path())) { return true; }
      else if (tab === 'manage_members' && (/^\/teams\/[^\/]+\/members\/manage$/).test($location.path())) { return true; }
      else if (tab === 'settings' && (/^\/teams\/[^\/]+\/settings$/).test($location.path())) { return true; }
      else if (tab === 'account' && (/^\/teams\/[^\/]+\/account$/).test($location.path())) { return true; }
      else if (tab === 'projects' && (/^\/teams\/[^\/]+\/projects+$/).test($location.path())) { return true; }
      else if (tab === 'bounties' && (/^\/teams\/[^\/]+\/bounties$/).test($location.path())) { return true; }
      else if (tab === 'issues' && (/^\/teams\/[^\/]+\/issues$/).test($location.path())) { return true; }
    };

    $scope.members = $api.team_members_get($routeParams.id).then(function(members) {
      $scope.$watch('current_person', function(person) {
        if (person) {
          for (var i=0; i<members.length; i++) {
            if (members[i].id === $scope.current_person.id) {
              $scope.is_member  = true;
              $scope.is_admin   = members[i].is_admin;
              $scope.is_developer = members[i].is_developer;
              $scope.is_public  = members[i].is_public;
              break;
            }
          }
        }

        // explicitly set to false if the logged in user is not part of the team
        $scope.is_member  = $scope.is_member || false;
        $scope.is_admin   = $scope.is_admin || false;
        $scope.is_developer = $scope.is_developer || false;
        $scope.is_public  = $scope.is_public || false;

        // a little hacky: If you lack the permissions, or are not logged in on /projects, redirect to /
        if (!($scope.is_admin || $scope.is_developer) || person === false) {
          if ((/^\/teams\/[^\/]+\/projects$/).test($location.path())) {
            $location.path("/teams/"+$routeParams.id).replace();
          }
        }
      });

      return members;
    });
  });
