angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.support_levels.show', {
    url: "/settings/support_levels/:id",
    title: "Support Levels",
    templateUrl: "salt/support_levels/show.html",
    container: false,
    controller: function($scope, $state, $modal, support_level, team) {
      $scope.support_level = support_level;
      $scope.team = team;

      // copied from teams#show
      $scope.share_url = $state.href('root.teams.show', $scope.team, { absolute: true });
      $scope.default_share_title = "Support " + $scope.team.name + ": " + ($scope.team.support_offering.subtitle||"Your help is needed!");

      $scope.show_destroy_modal = function() {
        var modalInstance = $modal.open({
          templateUrl: 'salt/support_levels/_destroy.html',
          controller: function($scope, team) {
            $scope.team = team;
            $scope.support_level = support_level;
            $scope.dismiss = function() {
              $scope.$dismiss();
            };
            $scope.edit_support = function() {
              $scope.$dismiss();
              $state.transitionTo('root.checkout.amount', { support_level_id: support_level.id });
            };
            $scope.cancel_support = function() {
              $scope.support_level.$delete(function(response) {
                $scope.$dismiss();
              });
            };
          },
          // size: size,
          resolve: {
            team: function () {
              return $scope.team;
            }
          }
        });
      };
    },
    resolve: {
      support_level: function($api, $stateParams) {
        return $api.support_levels.get({ id: $stateParams.id }).$promise;
      },
      team: function($api, $stateParams, support_level) {
        return $api.teams.get({
          slug: support_level.team.slug,
          accepts_public_payins: true,
          include_support_offering: true
        }).$promise;
      }
    }
  });
});
