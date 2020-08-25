angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.home.teams', {
    templateUrl: "salt/home/teams.html",
    container: false,
    controller: function($scope, $state, $stateParams, $timeout, $rootScope, tags) {
      $scope.tags = tags;

      $scope.search_data = {};
      $scope.search_counter = 0;
      $scope.last_time = 0;
      $scope.search_text_changed = function() {
        // 200ms delay so it doesn't refresh until you pause typing
        if ($scope.future_search) {
          $timeout.cancel($scope.future_search);
        }
        $scope.future_search = $timeout(function() {
          $state.transitionTo('root.home.teams.list', { search: $scope.search_data.query }, { location: 'replace' });
        }, 200);
      };

    },
    resolve: {
      tags: function($api) {
        return $api.tags.query({ featured: true, accept_public_payins: true, per_page: 50 }).$promise;
      }
    }
  });
});
