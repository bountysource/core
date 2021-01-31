angular.module('activity')
  .config(function($routeProvider, personResolver, defaultRouteOptions) {
    $routeProvider.when('/activity/pacts', angular.extend({
      templateUrl: 'app/activity/pacts.html',
      controller: 'PactsController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/bounties', angular.extend({
      templateUrl: 'app/activity/bounties.html',
      controller: 'BountiesController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/crypto_bounties', angular.extend({
      templateUrl: 'app/activity/crypto_bounties.html',
      controller: 'CryptoBountiesController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/claims', angular.extend({
      templateUrl: 'app/activity/bounty_claims.html',
      controller: 'BountyClaimsController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/crypto_pay_outs', angular.extend({
      templateUrl: 'app/activity/crypto_pay_outs.html',
      controller: 'CryptoPayOutsController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/fundraisers', angular.extend({
      templateUrl: 'app/activity/fundraisers.html',
      controller: 'FundraisersController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/pledges', angular.extend({
      templateUrl: 'app/activity/pledges.html',
      controller: 'PledgesController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity', angular.extend({
      templateUrl: 'app/activity/timeline.html',
      controller: 'TimelineController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/cash_outs', angular.extend({
      templateUrl: 'app/activity/cashOuts/index.html',
      controller: 'CashOutsController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/activity/cash_outs/new', angular.extend({
      templateUrl: 'app/activity/cashOuts/new.html',
      controller: 'NewCashOutController',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

  });
