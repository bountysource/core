'use strict';

angular.module('app').controller('NotificationsController', function($scope, $routeParams, $api, $pageTitle, $location, EmailPreference) {
  $pageTitle.set("Unsubscribe from Bountysource Emails");

  $scope.email = $routeParams.email;
  $scope.approved = false;

  $scope.unsubscribe = function() {
    // user must be signed in and have an access token

    $api.require_signin($location.path(), $routeParams);
    $scope.approved = true;
    $scope.processing = true;

    // hack to use v2 route specifically for proposals
    if ($routeParams.type === 'proposals') {
      // uses access_token to ID user email
      EmailPreference.update({ type: $routeParams.type, receive_email: false}, function (response, headers) {
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
