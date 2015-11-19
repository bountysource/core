'use strict';

angular.module('app').controller('NotificationsController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set("Unsubscribe from Bountysource Emails");

  $scope.selection = [];
  $scope.toggleCategory = function toggleSelection(category) {
    var idx = $scope.selection.indexOf(category);
    if (idx > -1) {
      $scope.selection.splice(idx, 1);
    } else {
      $scope.selection.push(category);
    }
  };

  $scope.approved = false;

  $scope.email = $routeParams.email;

  if (($routeParams.type === 'newsletter') || ($routeParams.type === 'newsletters')) {
    $scope.type = 'team_updates_1';
  } else if (($routeParams.type === 'bounty_alerts') && $routeParams.tracker_id) {
    $scope.type = 'bounty_alerts_tracker_' + $routeParams.tracker_id;
  } else {
    $scope.type = $routeParams.type;
  }

  if (!$scope.email || !$scope.type) {
    $scope.error = true;
  } else if ($scope.type.indexOf('bounty_alerts_tracker_') >= 0) {
    $scope.loading = true;
    var tracker_id = $scope.type.match(/bounty_alerts_tracker_(\d+)/)[1];
    $scope.tracker = $api.trackers.get({ id: tracker_id }, function(response) {
      $scope.loading = false;
    });
  } else if ($scope.type.indexOf('team_updates_') >= 0) {
    $scope.loading = true;
    var team_id = $scope.type.match(/team_updates_(\d+)/)[1];
    $scope.team = $api.teams.get({ slug: team_id, team_id: team_id }, function(response) {
      $scope.loading = false;
    });
  }

  $scope.unsubscribe = function(type) {
    $scope.loading = true;
    $api.people.unsubscribe({ recipient: $scope.email, categories: type }, function(success) {
      $scope.loading = false;
      $scope.approved = true;
    }, function(error) {
      $scope.error = true;
      $scope.loading = false;
    });
  };
});
