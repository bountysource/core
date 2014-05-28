"use strict";

angular.module('app').controller('IssueNavTabsController', function ($scope, $location, Team) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'bounties' && (/^\/issues\/[a-z-_0-9]+\/bounties$/).test($location.path())) { return "active"; }
    if (name === 'claims' && (/^\/issues\/[a-z-_0-9]+\/claims$/).test($location.path())) { return "active"; }
    if (name === 'rfp' && (/^\/issues\/[a-z-_0-9]+\/rfp/).test($location.path())) { return "active"; }
  };

  $scope.showRfpCreateTab = function () {
    return $scope.rfpEnabled; // defined in issues_base.js
  };
});
