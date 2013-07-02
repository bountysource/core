'use strict';

angular.module('app').controller('TrackerNavTabsController', function ($scope, $routeParams, $api) {
    $scope.active_tab = function() {
      // todo
      console.log($routeParams, $api);
    };
  });

