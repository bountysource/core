angular.module('app').controller('TeamManageProjectsController', function ($scope, $routeParams, $api, $pageTitle, $location, Team, Tracker, Tag) {
  // not a member, you can't see this
  $scope.$watch('is_member', function (is_member) {
    if(is_member === false) {
      $location.url("/teams/"+$routeParams.id).replace();
    }
  });
  $scope.projects = [];

  $scope.team_promise.then(function (team) {

    var refreshOwnedTrackers = function() {
      Tracker.query({ owner_team_id: team.id, include_team: true, per_page: 100, order: 'open_issues' }, function(trackers) {
        $scope.ownedTrackers = trackers;
      });
    };
    refreshOwnedTrackers();

    if (team.error) {
      $location.path('/teams');
    }

    $pageTitle.set(team.name, 'Teams');

    $scope.doTypeahead = function ($viewValue) {
      return $api.tracker_typeahead($viewValue);
    };

    $scope.claimTrackerValue = undefined;
    $scope.claimTracker = function(tracker) {
      $scope.own_project(tracker.id);
    };

    $scope.own_project = function (project_search) {
      if (typeof(project_search) === "number") {
        $api.claim_tracker(project_search, team.id, "Team").then(function (updated_team) {
          refreshOwnedTrackers();
        });
      } else if (project_search && project_search.length > 0) {
        // ????
      }
    };

    $scope.unclaim_tracker = function (tracker) {
      // remove the tracker from array immediately
      for (var i = 0; i < $scope.ownedTrackers.length; i++) {
        if ($scope.ownedTrackers[i].id === tracker.id) {
          $scope.ownedTrackers.splice(i, 1);
          break;
        }
      }

      tracker.owner = null;
      $api.unclaim_tracker(tracker.id, team.id, "Team").then(function (updated_team) {
        console.log("v1 team", updated_team);
        $scope.set_team(updated_team);
        refreshOwnedTrackers();
      });
    };

    $scope.trackerOwner = function () {
      var compare_team = team;
      return function (input) {
        return input.owner && input.owner.id === compare_team.id ? true : false;
      };
    };

    $scope.team_inclusions = {
      add: function(child_team) {
        Team.update({ slug: team.slug, add_child_team_inclusion: child_team.slug }, function(response) {
          $scope.team_inclusions.model = null;
          $scope.team_inclusions.refresh();
        });
      },

      remove: function(child_team) {
        Team.update({ slug: team.slug, remove_child_team_inclusion: child_team.slug }, function(response) {
          $scope.team_inclusions.model = null;
          $scope.team_inclusions.refresh();
        });
      },

      typeahead: function(search_text) {
        return Tag.query({ search: search_text, disclude_tags: true }).$promise;
      },

      refresh: function() {
        Team.query({ team_inclusion_parent: team.slug }, function(results) {
          $scope.team_inclusions.teams = results;
        });
      }
    };
    $scope.team_inclusions.refresh();

    return team;
  });
});
