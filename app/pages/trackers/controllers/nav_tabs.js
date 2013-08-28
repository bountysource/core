'use strict';

angular.module('app').controller('TrackerNavTabsController', function ($scope, $routeParams, $location) {
  $scope.tabs = [
  { name: "Issues", url: "/trackers/"+$routeParams.id},
  { name: "Activity", url: "/trackers/"+$routeParams.id+"/activity"}
  ];  

  $scope.is_active = function(url) {
    return url === $location.path();
  };
});

