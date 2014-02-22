'use strict';

angular.module('app').controller('TrackerNavTabsController', function ($scope, $routeParams, $api) {
  $scope.active_tab = function() {
    console.log($routeParams, $api);
  };
});
