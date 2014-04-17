'use strict';

angular.module('app').controller('TrackersIndex', function ($scope, $api, $window, Pagination) {

  $scope.getTrackers = function(params) {
    return $api.v2.trackers(params || {}).then(function(response) {
      if (response.success) {
        $scope.pagination = new Pagination(response);
        $scope.trackers = angular.copy(response.data);
      }
    });
  };

  $scope.setPage = function(page) {
    $scope.projects = [];
    return $scope.getTrackers({
      include_description: true,
      order: '+bounty',
      page: page
    }).then(function(response) {
      // Scroll to the top of the page once new items are loaded
      $window.scrollTo(0,0);

      return response;
    });
  };

  // Load initial trackers
  $scope.getTrackers({
    include_description: true,
    order: '+bounty',
    page: 1,
    per_page: 30
  });
});
