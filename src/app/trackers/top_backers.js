'use strict';

angular.module('app').controller('TrackerLeaderboardController', function ($scope, $routeParams, $api) {
  $api.tracker_top_backers($routeParams.id, {limit: 3}).then(function (response) {
    if (response.meta.success) {
      var backers = response.data.top_backers;
      for (var i = 0; i < backers.length; i++) {
        backers[i].total_backed = parseFloat(backers[i].total_backed, 10);
      }
      $scope.backers = backers;
    }
  });
});
