'use strict';

angular.module('app').run(function($rootScope) {
  $rootScope.$on("$routeChangeSuccess", function(event, next, current) {
    if (next && next.$$route && (next.$$route.container === false)) {
      $rootScope.global_container = false;
    } else {
      $rootScope.global_container = true;
    }
  });
});
