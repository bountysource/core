'use strict';

angular.module('app')
  .controller('MainController', function ($scope, $location, $rootScope) {
    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() === '/';
    });

    // change page title on change route
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
      if (current.$$route.title) {
        $rootScope.pageTitle = current.$$route.title;
      }
    });

  });
