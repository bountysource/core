'use strict';

angular.module('app').controller('HomeCtrl', function ($scope, $window, $api, $q) {

  // Top Fundraisers
  $api.v2.fundraisers({
    featured: true,
    order: 'pledge_total',
    per_page: 4
  }).then(function(response) {
    $scope.topFundraisers = angular.copy(response.data);
  });

  // Top Fundraisers
  $api.v2.teams({
    homepage_featured: true,
    per_page: 1
  }).then(function(response) {
    $scope.topTeams = angular.copy(response.data);
  });

  // Top Issue Trackers
  $api.v2.trackers({
    order: '+bounty',
    has_bounties: true,
    include_description: true,
    per_page: 5
  }).then(function(response) {
    $scope.topTrackers = angular.copy(response.data);
  });

  // Top Backers
  $api.v2.backers({
    order: '+amount',
    per_page: 10
  }).then(function(response) {
    $scope.topBackers = angular.copy(response.data);
  });

  // Newest members
  $api.v2.people({
    per_page: 6,
    order: '+created_at'
  }).then(function(response) {
    $scope.newestMembers = angular.copy(response.data);
  });

  // Members with the most followers
  $api.v2.people({
    per_page: 6,
    order: '+followers'
  }).then(function(response) {
    $scope.popularMembers = angular.copy(response.data);
  });

});
