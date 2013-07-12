'use strict';

angular.module('app').controller('FundraiserNavTabsController', function ($scope, $location) {
  $scope.active_tab = function(name) {
    if (name === 'overview' && (/^\/fundraisers\/[a-z-_0-9]+$/i).test($location.path())) { return "active"; }
    if (name === 'updates' && (/^\/fundraisers\/[a-z-_0-9]+\/updates$/i).test($location.path())) { return "active"; }
    if (name === 'pledges' && (/^\/fundraisers\/[a-z-_0-9]+\/pledges$/i).test($location.path())) { return "active"; }
    if (name === 'rewards' && (/^\/fundraisers\/[a-z-_0-9]+\/rewards$/i).test($location.path())) { return "active"; }
    if (name === 'pledge_now' && (/^\/fundraisers\/[a-z-_0-9]+\/pledge$/i).test($location.path())) { return "active"; }
  };
});

