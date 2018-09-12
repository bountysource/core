angular.module('activity').controller('ActivityNavTabsController', function($scope, NavTab) {

  $scope.navElements = [
    new NavTab('Timeline',      '/activity'),
    new NavTab('Fiat Bounties',      '/activity/bounties'),
    new NavTab('Crypto Bounties',      '/activity/crypto_bounties'),
    new NavTab('Bounty Claims', '/activity/claims'),
    new NavTab('Orders',        ['/orders', /^\/orders(\/\d+)?$/ ]),
    new NavTab('Crypto Pay Outs', '/activity/crypto_pay_outs'),
    new NavTab('Cash Outs',     ['/activity/cash_outs', '/activity/cash_outs/new' ])
  ];

});
