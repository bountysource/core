'use strict';

angular.module('app').controller('SigninCallbackController', function($scope, $api, $routeParams, $location, $window, $analytics) {
  if ($routeParams.status === 'linked') {
    $api.signin_with_access_token($routeParams.access_token).then(function(response) {
      if (response === false) {
        $scope.error = "ERROR: Unexpected linked account response.";
      } else {

        // Hack: Follow Trackers whose IDs are appended to the signin redirect URL.
        if ($routeParams.follow_tracker_ids) {
          var tracker_ids = $routeParams.follow_tracker_ids.split(',');
          for (var i=0; i<tracker_ids.length; i++) {
            $api.tracker_follow(tracker_ids[i]);
          }
        }

        $analytics.signIn({ provider: $routeParams.provider });
      }
    });
  } else if ($routeParams.status === 'error_needs_account') {
    $location.path('/signin').search($routeParams).replace();
  } else if ($routeParams.status === 'error_already_linked') {
    $scope.error = "ERROR: Account already linked.";
    console.log('ERROR: ');
  } else if ($routeParams.status === 'unauthorized') {
    $scope.error = "ERROR: Unauthorized.";
  } else {
    $scope.error = "ERROR: Unknown status.";
  }
});
