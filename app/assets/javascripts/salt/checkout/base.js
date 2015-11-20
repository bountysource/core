angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.checkout', {
    abstract: true,
    params: { team: '@team', support_level_id: '@support_level_id' },
    template: '<ui-view/>',
    controller: function($scope, team, support_level) {
      $scope.team = team;
      $scope.support_level = support_level;
    },
    resolve: {
      team: function($api, $stateParams, support_level) {
        return $api.teams.get({
          slug: (support_level ? support_level.team.slug : $stateParams.team),
          accepts_public_payins: true,
          include_support_offering: true
        }).$promise;
      },
      support_level: function($api, $stateParams) {
        if ($stateParams.support_level_id) {
          return $api.support_levels.get({ id: $stateParams.support_level_id }).$promise;
        }
      }
    }
  });

  $stateProvider.state('root.checkout.authed', {
    abstract: true,
    template: '<ui-view/>',
    controller: function($scope, person_teams) {
      $scope.person_teams = person_teams;
    },
    resolve: {
      auth: $stateProvider.personRequired,

      person_teams: function($api) {
        return $api.teams.query({ my_teams: true }).$promise;
      }
    }
  });

});
