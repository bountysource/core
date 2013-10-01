"use strict";

angular.module('app').controller('IssueNavTabsController', function($scope, $location) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'backers' && (/^\/issues\/[a-z-_0-9]+\/backers$/).test($location.path())) { return "active"; }
    if (name === 'claims' && (/^\/issues\/[a-z-_0-9]+\/claims$/).test($location.path())) { return "active"; }
    if (name === 'bounty' && (/^\/issues\/[a-z-_0-9]+\/bounty$/).test($location.path())) { return "active"; }
  };
});
