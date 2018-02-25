angular.module('app').controller('TeamHomeController', function ($route, $scope, $routeParams, $api, $pageTitle, $filter, $timeout, $window, Timeline, Team) {
  $scope.markdown_side_by_side = true;
  // redirect bountysource www team page to salt
  if ($routeParams.id === 'bountysource') {
    $window.location.replace('https://salt.bountysource.com/teams/bountysource');
  }

  $scope.bounty_hunters_for_team = $api.people.query({ bounty_hunters_for_team: $routeParams.id, per_page: 15 });

  $scope.team_promise.then(function(team) {
    if (!team || !team.id) {
      $pageTitle.set("Team not found");
      return;
    }

    $scope.show_right_column = !team.bounties_disabled && (team.bounty_hunter_count>0 || team.closed_bounties_amount>0 ||  team.open_bounties_amount>0);

    $pageTitle.set(team.name, 'Bountysource');
    $scope.events = Timeline.query({ per_page: 30, team_id: team.id });

    Team.query({
      related_to_team: team.slug,
      include_bio: true
    }, function(teams) {
      $scope.included_teams = $filter('filter')(teams, { team_included: true });
      $scope.backed_teams = $filter('filter')(teams, { team_included: false, team_backed: true });
      $scope.tagged_teams = $filter('filter')(teams, { team_included: false, team_backed: false, team_tagged: true });
    });

    /* start team admin */
    $scope.form_data = {
      default_markdown: "# Description\n\nClick to add a description explaining why your team is using Bountysource.",

      start_editing: function() {
        $scope.form_data.homepage_markdown = team.homepage_markdown || $scope.form_data.default_markdown;
        $scope.form_data.editing_description = true;
      },
      cancel_editing: function() {
        $scope.form_data.editing_description = false;
      },
      submit_form: function() {
        $scope.error = null;
        $scope.saving_form = true;
        $api.team_update($routeParams.id, { homepage_markdown: $scope.form_data.homepage_markdown }).then(function(updated_team) {
          $scope.saving_form = false;
          if (updated_team.error) {
            $scope.alert = { text: updated_team.error, type: "danger" };
          } else {
            $scope.form_data.editing_description = false;
            $scope.default_markdown_preview = updated_team.homepage_markdown;
            team.homepage_markdown = updated_team.homepage_markdown;
          }
        });
      }
    };
    $scope.update_preview = function() {
      $scope.edit_markdown_preview = $scope.form_data.homepage_markdown;
    };
    $scope.update_preview();

    $scope.$watch('form_data.homepage_markdown', function() {
      if ($scope.preview_promise) {
        $timeout.cancel($scope.preview_promise);
      }
      $scope.preview_promise = $timeout($scope.update_preview, 500);
    });
    /* end team admin */


  });

  $api.v2.call({ url: '/bounties/summary', params: { owner_team: $routeParams.id }}).then(function(bounty_summary) {
    $scope.bounty_summary = bounty_summary.data;
  });

});
