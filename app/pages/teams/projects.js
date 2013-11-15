'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teams/:id/projects', {
        templateUrl: 'pages/teams/projects.html',
        controller: 'BaseTeamController'
      });
  })
  .controller('TeamTrackersController', function ($scope, $routeParams, $api, $pageTitle, $location) {
    $scope.projects = [];

    $scope.team.then(function (team) {
      if (team.error) {
        $location.path('/teams');
      }
      $pageTitle.set(team.name, 'Teams');

      $scope.doTypeahead = function ($viewValue, type) {
        // return $api.tracker_typeahead($viewValue);
        return $api.tracker_typeahead($viewValue).then(function (response) {

          $scope.$watch(type, function (newValue, oldValue, scope) {
            for (var i = 0; i < response.length; i++) {
              if (newValue === response[i].id) {
                if (type === "project_owner_search") {
                  scope.own_project(newValue);
                } else {
                  scope.add_project(newValue);
                }
                break;
              }
            }
          });

          return response;
        });
      };

      $scope.add_project = function (project_search) {
        if (typeof(project_search) === "number") {
          $api.team_tracker_add(team.slug, project_search).then(function (updated_team) {
            $scope.set_team(updated_team);
            team.trackers = updated_team.trackers;
          });
          $scope.project_search = null;

        } else if (project_search && project_search.length > 0) {
          $scope.add_working = true;
          $api.search(project_search).then(function (response) {
            var tracker_id;
            if (response.redirect_to || response.tracker_id) {
              tracker_id = response.tracker_id ? response.tracker_id : response.redirect_to.match(/\d+/);
              $api.team_tracker_add(team.slug, tracker_id).then(function (updated_team) {
                $scope.add_working = false;
                $scope.set_team(updated_team);
                team.trackers = updated_team.trackers;
              });
              $scope.project_search = null;

            } else {

              $scope.search_results = response;
              // MAKE VIEW FOR SEARCH RESULTS
            }
          });
        }

      };

      $scope.own_project = function (project_search) {

        if (typeof(project_search) === "number") {
          $api.claim_tracker(project_search, team.id, "Team").then(function (updated_team) {
            $scope.set_team(updated_team);
            team.trackers = updated_team.trackers;
            $scope.project_owner_search = null;
          });

        } else if (project_search && project_search.length > 0) {
          $scope.working = true;
          $api.search(project_search).then(function (response) {

            var tracker_id;
            if (response.redirect_to || response.tracker_id) {
              tracker_id = response.tracker_id ? response.tracker_id : response.redirect_to.match(/\d+/);

              $api.claim_tracker(tracker_id, team.id, "Team").then(function (updated_team) {
                $scope.working = false;
                $scope.set_team(updated_team);
                team.trackers = updated_team.trackers;
              });

              $scope.project_owner_search = null;
            } else {
              $scope.search_results = response;
              // MAKE VIEW FOR SEARCH RESULTS
            }
          });
        }
      };

      $scope.remove_tracker = function (tracker) {
        // remove the tracker from array immediately
        for (var i = 0; i < team.trackers.length; i++) {
          if (team.trackers[i].id === tracker.id) {
            team.trackers.splice(i, 1);
            break;
          }
        }
        // actually remove the project!
        $api.team_tracker_remove(team.slug, tracker.id);

        //also remove as owner if you remove tracker from used-projects
        if (tracker.owner && tracker.owner.id === team.id) {
          $scope.unclaim_tracker(tracker);
        }
      };

      $scope.unclaim_tracker = function (tracker) {
        tracker.owner = null;
        $api.unclaim_tracker(tracker.id, team.id, "Team");
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
        }
      };

      return team;
    });
  });
