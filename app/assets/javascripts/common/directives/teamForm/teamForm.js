angular.module('directives').directive('teamForm', function ($analytics, $api, $routeParams, $location, $filter, $window) {
  return {
    restrict: 'EA',
    templateUrl: 'common/directives/teamForm/teamForm.html',
    scope: {
      team: "=",
      options: "="
    },
    link: function (scope) {
      // set and parse view options
      scope.defaultOptions = {
        editForm: false
      };
      scope._options = angular.extend(scope.defaultOptions, scope.options||{});

      // if team present, we are doing an edit form
      scope.$watch('team', function (team) {
        // don't execute unless there is a team object, otherwise we get console errors
        if (team) {
          var edit_team = scope.team;

          // build form_data for team_edit
          scope.form_data = {
            name: edit_team.name,
            slug: edit_team.slug,
            url: edit_team.url,
            bio: edit_team.bio,
            accepts_public_payins: edit_team.accepts_public_payins,
            accepts_issue_suggestions: edit_team.accepts_issue_suggestions
          };

          scope.update_team = function(form_data) {
            $api.team_update(edit_team.slug, form_data).then(function(updated_team) {
              if (updated_team.error) {
                scope.alert = { text: updated_team.error, type: "danger" };
              } else {
                $location.url("/teams/" + updated_team.slug);
              }
            });
          };
        }
      });

      scope.$watch('form_data.name', function() {
        if (!scope.team) {
          scope.form_data.slug = $filter('slug')(scope.form_data.name).replace(/-(inc|llc)$/,'');
        }
      });

      scope.create_team = function (form_data) {
        scope.creating_team = true;
        // by default, teams can accept public_payins
        form_data.accepts_public_payins = true;

        $api.team_create(form_data).then(function(team) {
          scope.creating_team = false;

          if (team.error) {
            scope.error = team.error;
          } else if ($routeParams.creating_fundraiser) {
            // mixpanel track event
            $analytics.startFundraiserDraft(team.id, { type: "new_team"});
            $location.url("/teams/"+team.slug+"/fundraisers/new");
          } else if ($routeParams.salt) {
            $window.location.href = 'https://salt.bountysource.com/teams/' + team.slug;
          } else {
            $location.url("/teams/"+team.slug);
          }
        });
      };
    }
  };
});
