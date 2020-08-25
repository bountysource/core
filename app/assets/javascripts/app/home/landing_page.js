angular.module('app').controller('LandingPageController', function ($scope, $api, Timeline, $modal) {
  // Post Bounty Button
  $scope.openPostBountyModal = function(){
    $modal.open({
      templateUrl: 'app/home/post_bounty_modal.html',
      controller: function($scope, $location, $modalInstance) {
        $scope.form_data = {};

        $scope.submit_search = function() {
          $location.path("/search").search({ query: $scope.form_data.url });
          $modalInstance.close();
        };

        $scope.close = function() {
          $modalInstance.close();
        };
      }
    });
  };

  // Recent Activity
  $scope.events = Timeline.query({ per_page: 30, bounties_only: true });

  // Top Backers
  $api.v2.teams({
    top_rewards: true
  }).then(function(response) {
    $scope.topTeams = response.data;
  });

  // Top Hunters
  $api.v2.people({
    bounty_hunters: 'alltime'
  }).then(function(response) {
    $scope.bounty_hunters = angular.copy(response.data);
  });
});