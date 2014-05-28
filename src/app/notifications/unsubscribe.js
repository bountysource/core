'use strict';

angular.module('app').controller('NotificationsController', function($scope, $routeParams, $api, $pageTitle, EmailPreference) {
  $pageTitle.set("Unsubscribe from Bountysource Emails");

  $scope.email = $routeParams.email;
  $scope.approved = false;

  $scope.unsubscribe = function() {
    $scope.approved = true;
    $scope.processing = true;

    // hack to use v2 route specifically for proposals
    if ($routeParams.type === 'proposals') {
      EmailPreference.update({ type: $routeParams.type, email: $scope.email , receive_email: false}, function (response, headers) {
        // success
        $scope.success = true;
        $scope.processing = false;
      }, function (response, headers) {
        //error
        $scope.processing = false;
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
