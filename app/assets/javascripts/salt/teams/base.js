angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams', {
    abstract: true,
    params: { slug: '@slug' },
    template: '<ui-view/>',
    controller: function($scope, $state, $filter, team, top_supporters, support_levels) {
      $scope.team = team;

      if(!team.accepts_public_payins) {
        $state.transitionTo('root.teams.not_activated', {slug: team.slug})
      }


      $scope.top_supporters = top_supporters;

      // show existing support
      $scope.support_levels = support_levels;
      $scope.support_levels_total = 0.0;
      $scope.support_levels_count = 0;
      $scope.first_active_support_level = null;
      angular.forEach(support_levels, function(value) {
        if (['active'].indexOf(value.status) >= 0) {
          if (!$scope.first_active_support_level) {
            $scope.first_active_support_level = value;
          }
          $scope.support_levels_total += value.amount;
          $scope.support_levels_count += 1;
        }
      });


      // copied to support_levels#show
      $scope.share_url = $state.href('root.teams.show', $scope.team, { absolute: true });
      $scope.default_share_title = "Support " + $scope.team.name + ": " + (($scope.team.support_offering.subtitle && $scope.team.support_offering.subtitle.length > 0) ? $scope.team.support_offering.subtitle : "Your help is needed!");

      // if there are goals, set the
      if (($scope.team.support_offering.goals||[]).length > 0) {
        // if we're still at 100% and there's a greater goal, use that instead
        $scope.progress_green_percent = null;
        $scope.progress_yellow_percent = null;
        angular.forEach($filter('orderBy')($scope.team.support_offering.goals, 'amount'), function(value) {
          if (($scope.progress_green_percent===null) || (($scope.progress_green_percent+$scope.progress_yellow_percent) >= 100)) {
            $scope.progress_next_goal = value.amount;
            $scope.progress_green_percent = 100.0 * ($scope.team.support_level_sum) / value.amount;
            $scope.progress_yellow_percent = 100.0 * ($scope.team.monthly_contributions_sum - $scope.team.support_level_sum) / value.amount;
          }
        });

        // always show a little green
        $scope.progress_text = parseInt($scope.progress_green_percent + $scope.progress_yellow_percent);
        if (($scope.progress_green_percent + $scope.progress_yellow_percent) < 10) {
          $scope.progress_green_percent = 10*($scope.progress_green_percent/($scope.progress_green_percent+$scope.progress_yellow_percent));
          $scope.progress_yellow_percent = 10-$scope.progress_green_percent;
        } else if (($scope.progress_green_percent + $scope.progress_yellow_percent) > 100) {
          $scope.progress_green_percent = 100*($scope.progress_green_percent/($scope.progress_green_percent+$scope.progress_yellow_percent));
          $scope.progress_yellow_percent = 100-$scope.progress_green_percent;
        }
      }
    },
    resolve: {
      team: function($api, $stateParams) {
        return $api.teams.get({
          slug: $stateParams.slug,
          include_supporter_stats: true,
          include_support_offering: true
        }).$promise;
      },

      top_supporters: function($api, $stateParams) {
        return $api.supporters.query({ team_slug: $stateParams.slug, per_page: 10, order: 'monthly' }).$promise;
      },

      support_levels: function($api, $stateParams, person) {
        if (person.id) {
          return $api.support_levels.query({ team_slug: $stateParams.slug }).$promise;
        } else {
          return [];
        }
      }
    }
  });
});
