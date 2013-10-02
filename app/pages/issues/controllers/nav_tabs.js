"use strict";

angular.module('app').controller('IssueNavTabsController', function ($scope, $location, $api) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/issues\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'bounties' && (/^\/issues\/[a-z-_0-9]+\/bounties$/).test($location.path())) { return "active"; }
    if (name === 'claims' && (/^\/issues\/[a-z-_0-9]+\/claims$/).test($location.path())) { return "active"; }
    if (name === 'bounty' && (/^\/issues\/[a-z-_0-9]+\/bounty$/).test($location.path())) { return "active"; }
    if (name === 'receipts' && (/^\/issues\/[a-z-_0-9]+\/receipts$/).test($location.path())) { return "active"; }
  };

  $scope.receipts = [];
  $scope.issue.then(function (issue) {
    $api.bounty_activity().then(function (response) {
      for (var i = 0; i < response.length; i++) {  //grab all of the users pledges, if any of them have the same ID as this fundraiser, then push to the receipts array
        if (response[i].issue.id === issue.id) {
          $scope.receipts.push(response[i]);
        }
      }
    });
  });
});
