'use strict';

angular.module('app.controllers').controller('TrackerNavTabsController', ['$scope', '$routeParams', '$api', function ($scope, $routeParams, $api) {
  $scope.active_tab = function() {
    console.log($routeParams, $api);
  };
}]);
