'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.home.teams.list', {
    url: "/?search&tag&newest",
    title: "Home",
    templateUrl: "salt/home/teams_list.html",
    container: false,
    controller: function($scope, $stateParams, teams) {
      $scope.teams = teams;

      if ($stateParams.search && !$scope.search_data.query) {
        $scope.search_data.query = $stateParams.search;
      } else if (!$stateParams.search) {
        $scope.search_data.query = null;
      }
    },
    resolve: {
      teams: function($api, $stateParams) {
        var request = {
          accepts_public_payins: true,
          include_supporter_stats: true,
          include_bio: true,
          per_page: 50
        };
        if ($stateParams.search) {
          request.search = $stateParams.search;
        } else if ($stateParams.tag) {
          if ($stateParams.tag.match(/^\d+$/)) {
            request.tag_child_type = 'Tag';
            request.tag_child_id = $stateParams.tag;
          } else {
            request.tag_child_type = 'TeamSlug';
            request.tag_child_id = $stateParams.tag;
          }
        } else if ($stateParams.newest) {
          request.newest = true;
        }

        return $api.teams.silent_query(request).$promise;
      }
    }
  });
});
