'use strict';

angular.module('app')
  .controller('MainController', function ($scope, $location, $rootScope) {
    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() === '/';
    });
  });
