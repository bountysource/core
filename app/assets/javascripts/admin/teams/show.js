angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/teams/:id', {
        templateUrl: 'admin/teams/show.html',
        controller: 'TeamsShowController'
      });
  })
  .controller('TeamsShowController', function ($scope, $api, $routeParams, $window, $location, $route) {

    $api.get_team($routeParams.id).then(function(response) {
      $scope.team = response;
      $scope.form_data = {
        name: response.name,
        slug: response.slug,
        bio: response.bio,
        url: response.url,
        linked_account_login: response.linked_account_login,
        accepts_public_payins: response.accepts_public_payins,
        accepts_issue_suggestions: response.accepts_issue_suggestions,
        can_email_stargazers: response.can_email_stargazers,
        bounties_disabled: response.bounties_disabled,
        featured: response.featured,
        homepage_featured: response.homepage_featured,
        homepage_markdown: response.homepage_markdown,
        new_issue_suggestion_markdown: response.new_issue_suggestion_markdown,
        bounty_search_markdown: response.bounty_search_markdown,
        resources_markdown: response.resources_markdown
      };

      $api.callv2({ url: '/tags?parent_type=Team&parent_id=' + $scope.team.id }).then(function(response) {
        $scope.parent_tag_relations = response.data;
      });
      $api.callv2({ url: '/tags?child_type=Team&child_id=' + $scope.team.id }).then(function(response) {
        $scope.child_tag_relations = response.data;
      });

      $scope.team_payins = $api.call("/admin/team_payins", { team_id: $scope.team.id });

      $scope.team_inclusions = {
        refresh: function() {
          $scope.team_inclusions.model = null;
          $api.callv2({ url: '/teams?team_inclusion_parent=' + $scope.team.slug }).then(function(response) {
            $scope.team_inclusions.current = response.data;
          });
        },

        remove: function(child_team) {
          $api.update_team($scope.team.id, { remove_child_team_inclusion: child_team.slug }).then(function(response) {
            $scope.team_inclusions.refresh();
          });
        },

        add: function() {
          $api.update_team($scope.team.id, { add_child_team_inclusion: $scope.team_inclusions.model }).then(function(response) {
            $scope.team_inclusions.refresh();
          });
        }
      };
      $scope.team_inclusions.refresh();

    });

    $scope.$watch('form_data.slug', function() {
      if ($scope.team && $scope.team.slug && ($scope.team.slug !== $scope.form_data.slug)) {
        $api.get_team($scope.form_data.slug).then(function(team) {
          if (team) {
            $scope.conflicting_team = team;
          } else {
            $scope.conflicting_team = false;
          }
        });
      } else {
        $scope.conflicting_team = false;
      }
    });


    $scope.setPermission = function(person_id, permission, value) {
      $api.update_team($scope.team.id, { update_member: person_id, permission: permission, value: value }).then(function(response) {
        $window.location.reload();
      });
    };

    $scope.addMember = function() {
      $api.update_team($scope.team.id, { add_member: $scope.add_person_id }).then(function(response) {
        $window.location.reload();
      });
    };

    $scope.removeMember = function(person_id) {
      $api.update_team($scope.team.id, { remove_member: person_id }).then(function(response) {
        $window.location.reload();
      });
    };

    $scope.addTrackers = function() {
      $api.update_team($scope.team.id, { add_trackers: $scope.add_tracker_ids }).then(function(response) {
        $scope.add_tracker_ids = null;
        $scope.team = response;
      });
    };

    $scope.removeTeamTracker = function(tracker_id) {
      $api.update_team($scope.team.id, { remove_tracker: tracker_id }).then(function(response) {
        $scope.team = response;
      });
    };

    $scope.removeOwnership = function(tracker_id) {
      $api.update_team($scope.team.id, { remove_ownership: tracker_id }).then(function(response) {
        $scope.team = response;
      });
    };

    $scope.takeOwnership = function(tracker_id) {
      $api.update_team($scope.team.id, { take_ownership: tracker_id }).then(function(response) {
        $scope.team = response;
      });
    };

    $scope.deleteTeam = function() {
      if (prompt("Type DELETE below if you really want to delete this team") === 'DELETE') {
        $api.delete_team($scope.team.id).then(function(response) {
          alert("All done!");
        });
      }
    }

    $scope.updateTeamAttributes = function() {
      $scope.update_message = "Updating...";
      $api.update_team($scope.team.id, $scope.form_data).then(function(response) {
        if (response.error) {
          $scope.update_message = response.error;
        } else {
          $location.url("/admin/teams/" + response.slug);
          $route.reload();
        }
      });
    };

    $scope.mergeConflictedTeam = function() {
      if ($scope.team.id && $scope.conflicting_team.id && confirm("Are you sure?")) {
        $api.update_team($scope.team.id, { merge_with: $scope.conflicting_team.id }).then(function(response) {
          if (response.error) {
            $scope.update_message = response.error;
          } else {
            $location.url("/admin/teams/" + response.slug);
            $route.reload();
          }
        });
      }
    };

  });
