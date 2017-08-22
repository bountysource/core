angular.module('activity')
  .config(function($routeProvider, personResolver, defaultRouteOptions) {

    $routeProvider.when('/activity/bounties', angular.extend({
      templateUrl: 'app/activity/bounties.html',
      controller: 'BountiesController',
      resolve: { person: personResolver },
      trackEvent: 'View My Bounties'
    }, defaultRouteOptions));

    $routeProvider.when('/activity/claims', angular.extend({
      templateUrl: 'app/activity/bounty_claims.html',
      controller: 'BountyClaimsController',
      resolve: { person: personResolver },
      trackEvent: 'View My Claims'
    }, defaultRouteOptions));

    $routeProvider.when('/activity/fundraisers', angular.extend({
      templateUrl: 'app/activity/fundraisers.html',
      controller: 'FundraisersController',
      resolve: { person: personResolver },
      trackEvent: 'View My Fundraisers'
    }, defaultRouteOptions));

    $routeProvider.when('/activity/pledges', angular.extend({
      templateUrl: 'app/activity/pledges.html',
      controller: 'PledgesController',
      resolve: { person: personResolver },
      trackEvent: 'View My Pledges'
    }, defaultRouteOptions));

    $routeProvider.when('/activity', angular.extend({
      templateUrl: 'app/activity/timeline.html',
      controller: 'TimelineController',
      resolve: { person: personResolver },
      trackEvent: 'View My Timeline'
    }, defaultRouteOptions));

    $routeProvider.when('/activity/cash_outs', angular.extend({
      templateUrl: 'app/activity/cashOuts/index.html',
      controller: 'CashOutsController',
      resolve: { person: personResolver },
      trackEvent: 'View My Cash Outs'
    }, defaultRouteOptions));

    $routeProvider.when('/activity/cash_outs/new', angular.extend({
      templateUrl: 'app/activity/cashOuts/new.html',
      controller: 'NewCashOutController',
      resolve: { person: personResolver },
      trackEvent: 'View Request Cash Out'
    }, defaultRouteOptions));

    $routeProvider.when('/activity/cash_outs/tax_form', angular.extend({
      templateUrl: 'app/activity/cashOuts/tax_form.html',
      controller: 'TaxFormController',
      resolve: { person: personResolver },
      trackEvent: 'View Tax Form Request'
    }, defaultRouteOptions));

  });
