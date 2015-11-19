'use strict';

angular.module('app')
.controller("BountyClaimNavTabs", function ($scope, $location) {
  $scope.tabs = [
    { title: "Priority", value: "priority", href: "priority"},
    { title: "All", value: "all", href: ""}
  ];

  $scope.active_tab = function(name) {
    if (name === 'priority' && (/^\/claims\/priority$/i).test($location.path())) { return "active"; }
    if (name === 'all' && (/^\/claims$/i).test($location.path())) { return "active"; }
  };

});
