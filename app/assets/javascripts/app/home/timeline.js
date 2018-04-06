angular.module('app').controller('HomeTimelineCtrl', function ($scope, $api, $location, Timeline) {
  $scope.events = Timeline.query({ per_page: 30, include_featured_bounties: true, bounties_only: true });
  $scope.new_bounties = Timeline.query({ per_page: 30, new_bounties_only: true });
  $scope.default_tab = true;

  $scope.form_data = {};
  $scope.submit_search = function() {
    $location.path("/search").search({ query: $scope.form_data.url });
  };

  // Top Backers
  $api.v2.teams({
    homepage_featured: true
  }).then(function(response) {
    $scope.featuredTeams = response.data;
  });

  // Newest members
  $api.v2.people({
    bounty_hunters: 'alltime'
  }).then(function(response) {
    $scope.bounty_hunters_alltime = angular.copy(response.data);
  });

  // Members with the most followers
  $api.v2.people({
    bounty_hunters: '90days'
  }).then(function(response) {
    $scope.bounty_hunters_month = angular.copy(response.data);
    $scope.bounty_hunters = $scope.bounty_hunters_month;
  });

});
