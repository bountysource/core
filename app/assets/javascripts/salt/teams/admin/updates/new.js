'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.admin.updates.new', {
    url: "/teams/{slug}/admin/updates/new?id",
    templateUrl: "salt/teams/admin/updates/new.html",
    container: false,
    controller: function($scope, $state, $timeout, $api, $location, team, update, mailing_lists) {

      $scope.mailing_lists = mailing_lists;

      $scope.form_data = {
        team_slug: $scope.team.slug,
        mailing_lists: ['bountysource']
      };

      if (update) {
        $scope.update = update;
        $scope.form_data.title = update.title;
        $scope.form_data.body = update.body;
        $scope.form_data.mailing_lists = update.mailing_lists;
        // 00-132 is a hacky notation to differentiate ID from NUMBER
        $scope.form_data.id = "00-"+update.id;
      }

      $scope.update_preview = function() {
        $scope.markdown_preview = ($scope.form_data.body||'');
      };
      $scope.update_preview();

      $scope.$watch('form_data.body', function() {
        if ($scope.preview_promise) {
          $timeout.cancel($scope.preview_promise);
        }
        $scope.preview_promise = $timeout($scope.update_preview, 500);
      });

      $scope.submit_form = function(form, params) {
        params = angular.extend({}, params, $scope.form_data);

        $scope.error = null;
        $scope.saving_form = true;

        var api_actor = $scope.update ? $api.team_updates.update : $api.team_updates.create;
        api_actor(params, function(response) {
          //   if (error.....) {
          //     $scope.error = response.data.error;
          //   } else if
          if (response.published_at) {
            $state.transitionTo('root.teams.updates.show', { slug: team.slug, number: response.slug });
          } else if (!$scope.update) {
            // new object just created?
            $state.transitionTo('root.teams.admin.updates.new', { slug: team.slug, id: response.id });
          } else {
            $scope.saving_form = false;
            form.$setPristine();
          }
        });
      };

      $scope.toggle_mailing_list = function(form, list_id) {
        form.$setDirty();

        var idx = $scope.form_data.mailing_lists.indexOf(list_id);
        if (idx > -1) {
          $scope.form_data.mailing_lists.splice(idx, 1);
        } else {
          $scope.form_data.mailing_lists.push(list_id);
        }
      };

    },

    resolve: {
      update: function($api, $state, $stateParams, team) {
        if ($stateParams.id) {
          // 00-132 is a hacky notation to differentiate ID from NUMBER
          var promise = $api.team_updates.get({ team_slug: team.slug, id: "00-"+$stateParams.id }).$promise;

          promise.then(function(update) {
            if (update.published_at) {
              $state.transitionTo('root.teams.updates.show', { slug: team.slug, number: update.slug });
            }
          });

          return promise;
        }
      },

      mailing_lists: function($api, $state, team) {
        return $api.team_updates.mailing_lists({ team_slug: team.slug }).$promise;
      }
    }
  });
});
