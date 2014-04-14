'use strict';

angular.module('activity').controller('ActivityNavTabsController', function($scope, NavTab) {

  $scope.navElements = [
    new NavTab('Timeline',      '/activity'),
    new NavTab('Bounties',      '/activity/bounties'),
    new NavTab('Fundraisers',   '/activity/fundraisers'),
    new NavTab('Pledges',       '/activity/pledges'),
    new NavTab('Bounty Claims', '/activity/claims'),
    new NavTab('Transactions', [
      '/activity/account',
      '/activity/transactions',
      /^\/activity\/cash_outs(\/new)?$/
    ])
  ];

});