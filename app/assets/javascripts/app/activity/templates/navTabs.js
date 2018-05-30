angular.module('activity').controller('ActivityNavTabsController', function($scope, NavTab) {

  $scope.navElements = [
    new NavTab('Timeline',      '/activity'),
    new NavTab('Bounties',      '/activity/bounties'),
    new NavTab('Bounty Claims', '/activity/claims'),
    new NavTab('Orders',        ['/orders', /^\/orders(\/\d+)?$/ ]),
    new NavTab('Cash Outs',     ['/activity/cash_outs', '/activity/cash_outs/new' ])
  ];

});
