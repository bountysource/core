'use strict';

angular.module('app').controller('TeamManageProjectsController', function ($scope, $routeParams, $api, $pageTitle, $location) {
  $scope.projects = [];

  $scope.team_promise.then(function (team) {
    console.log("first team load", team);
    if (team.error) {
      $location.path('/teams');
    }
    $pageTitle.set(team.name, 'Teams');

    $scope.doTypeahead = function ($viewValue, type) {
      return $api.tracker_typeahead($viewValue).then(function(results) {
        $scope.$watch(type, function (newValue, oldValue, scope) {
          for (var i = 0; i < results.length; i++) {
            if (newValue === results[i].id) {
              if (type === "project_owner_search") {
                // set to null to cancel recurring API calls
                scope.project_owner_search = null;
                scope.own_project(newValue);
              } else {
                // set to null to cancel recurring API calls
                scope.project_owner_search = null;
                scope.add_project(newValue);
              }
              break;
            }
          }
        });

        return results;
      });
    };

    $scope.add_project = function (project_search) {
      if (typeof(project_search) === "number") {
        $api.team_tracker_add(team.slug, project_search).then(function (updated_team) {
          $scope.set_team(updated_team);
          $scope.team = $scope.process_owned_unowned_trackers(updated_team);
        });
        $scope.project_search = null;

      } else if (project_search && project_search.length > 0) {
        // ????
      }
    };

    $scope.remove_tracker = function (tracker) {
      // remove the tracker from array immediately
      for (var i = 0; i < team.unowned_trackers.length; i++) {
        if (team.unowned_trackers[i].id === tracker.id) {
          team.unowned_trackers.splice(i, 1);
          break;
        }
      }
      // actually remove the project!
      $api.team_tracker_remove(team.slug, tracker.id).then(function (updated_team) {
        $scope.team = $scope.process_owned_unowned_trackers(updated_team);
      });

      //also remove as owner if you remove tracker from used-projects
      if (tracker.owner && tracker.owner.id === team.id) {
        $scope.unclaim_tracker(tracker);
      }
    };

    $scope.own_project = function (project_search) {
      if (typeof(project_search) === "number") {
        $api.claim_tracker(project_search, team.id, "Team").then(function (updated_team) {
          $scope.team = $scope.process_owned_unowned_trackers(updated_team);
        });
      } else if (project_search && project_search.length > 0) {
        // ????
      }
    };

    $scope.unclaim_tracker = function (tracker) {
      // remove the tracker from array immediately
      for (var i = 0; i < team.owned_trackers.length; i++) {
        if (team.owned_trackers[i].id === tracker.id) {
          team.owned_trackers.splice(i, 1);
          break;
        }
      }
      tracker.owner = null;
      $api.unclaim_tracker(tracker.id, team.id, "Team").then(function (updated_team) {
        $scope.set_team(updated_team);
        $scope.team = $scope.process_owned_unowned_trackers(updated_team);
      });
    };

    $scope.trackerOwner = function () {
      var compare_team = team;
      return function (input) {
        return input.owner && input.owner.id === compare_team.id ? true : false;
      };
    };

    $scope.trackerUsed = function() {
      return function(tracker) {
        return !tracker.$owned;
      };
    };

    return team;
  });
});
