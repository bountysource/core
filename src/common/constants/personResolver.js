'use strict';

/*
* This returns a promise and is meant to block rotues via "resolve: $person". it redirects to /signin if need be.
*
* TODO: Make a better way to require auth on pages?
* */
angular.module('constants').constant('personResolver', function($q, $rootScope, $location, $api) {
  var deferred = $q.defer();

  var success = function() {
    deferred.resolve();
  };

  var failure = function() {
    deferred.reject();
    $api.set_post_auth_url($location.url());
    $location.url('/signin').replace();
  };

  if ($rootScope.current_person) {
    // already logged in? go ahead and resolve immediately
    $rootScope.$evalAsync(success);
  } else if ($rootScope.current_person === false) {
    // not logged in? go ahead and fail
    $rootScope.$evalAsync(failure);
  } else {
    // otherwise we're still waiting on load_current_person_from_cookies (likely a fresh page load)
    $rootScope.$watch('current_person', function() {
      if ($rootScope.current_person) {
        success();
      } else if ($rootScope.current_person === false) {
        failure();
      }
    });
  }

  return deferred.promise;
});