'use strict';

angular.module('activity').controller('ActivityTabs', function($scope, $location) {

  $scope.tabs = [
    { name: 'Timeline',       url: '/activity' },
    { name: 'Bounties',       url: '/activity/bounties' },
    { name: 'Fundraisers',    url: '/activity/fundraisers' },
    { name: 'Pledges',        url: '/activity/pledges' },
    { name: 'Bounty Claims',  url: '/activity/claims' },
    { name: 'Account',        url: ['/activity/transactions', '/activity/transactions/orders', '/activity/transactions/cash_outs'] }
  ];
  $scope.is_active = function(url) {
    url = angular.isArray(url) ? url : [url];
    for (var i=0; i<url.length; i++) {
      if (url[i] === $location.path()) {
        return true;
      }
    }
    return false;
  };

});
