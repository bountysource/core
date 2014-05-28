'use strict';

angular.module('app').controller('NotificationsController', function($scope, $routeParams, $api, $pageTitle) {
  $pageTitle.set("Unsubscribe from Bountysource Emails");

  $scope.email = $routeParams.email;
  $scope.approved = false;

  $scope.unsubscribe = function() {
    $scope.approved = true;
    $scope.processing = true;

    // hack to use v2 route specifically for proposals
    if ($routeParams.type === 'proposals') {
      $api.v2.unsubscribe( { type: $routeParams.type, email: $scope.email , receive_email: false}).then(function (response) {
        $scope.processing = false;
        if (response.success) {
          $scope.success = response;
        } else {
          $scope.error = response.data.error;
        }
        return response;
      });
    } else {
      $api.notification_unsubscribe($routeParams.type, { email: $scope.email }).then(function(success) {
        $scope.processing = false;
        $scope.success = success;
        return success;
      });
    }
  };
});
