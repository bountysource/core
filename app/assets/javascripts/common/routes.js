angular.module('app').config(function ($routeProvider, defaultRouteOptions, personResolver) {
  $routeProvider.when('/', angular.extend({
    templateUrl: 'app/home/timeline.html',
    controller: 'HomeTimelineCtrl',
    container: false,
    trackEvent: 'View Homepage Timeline',
    resolve: {
      count: function($rootScope, $api) {
        $api.people_count().then(function(count) {
          $rootScope.people_count = count;
        });
      }
    }
  }, defaultRouteOptions));

  $routeProvider.when('/fees', angular.extend({
    templateUrl: 'app/about/fees.html',
    controller: 'StaticPageController',
    title: 'Pricing',
    trackEvent: 'View Pricing'
  }, defaultRouteOptions));

  $routeProvider.when('/stats', angular.extend({
    templateUrl: 'app/about/stats.html',
    controller: 'StatsPageController',
    title: 'Stats',
    trackEvent: 'View Stats'
  }, defaultRouteOptions));

  $routeProvider.when('/learn', angular.extend({
    templateUrl: 'app/about/learn.html',
    controller: 'StaticPageController',
    title: 'Learn',
    trackEvent: 'View Learn'
  }, defaultRouteOptions));

  $routeProvider.when('/privacy', angular.extend({
    templateUrl: 'app/about/privacy_policy.html',
    controller: 'StaticPageController',
    title: 'Privacy Policy',
    trackEvent: 'View Privacy'
  }, defaultRouteOptions));

  $routeProvider.when('/terms', angular.extend({
    templateUrl: 'app/about/terms.html',
    controller: 'StaticPageController',
    title: 'Terms of Service',
    trackEvent: 'View Terms'
  }, defaultRouteOptions));

  $routeProvider.when('/auth/:provider/confirm', angular.extend({
    templateUrl: "app/auth/auth.html",
    controller: "AuthConfirmController",
    resolve: { person: personResolver },
    trackEvent: false
  }, defaultRouteOptions));

  $routeProvider.when('/bounties/search', angular.extend({
    templateUrl: 'app/bounties/search.html',
    controller: 'BountiesSearchController',
    trackEvent: 'View Bounties Search'
  }, defaultRouteOptions));

  $routeProvider.when('/cart', angular.extend({
    templateUrl: 'app/cart/cart.html',
    controller: 'ShoppingCartController',
    trackEvent: 'View Cart'
  }, defaultRouteOptions));

  $routeProvider.when('/issues', angular.extend({
    templateUrl: 'app/issues/index.html',
    controller: 'IssueIndexController',
    trackEvent: 'View Issues'
    
  }, defaultRouteOptions));

  $routeProvider.when('/issues/thumbs', angular.extend({
    templateUrl: 'app/issues/thumbs.html',
    controller: 'IssueThumbsController',
    resolve: { person: personResolver },
    trackEvent: 'View Thumbs'
  }, defaultRouteOptions));

  $routeProvider.when('/extension', angular.extend({
    templateUrl: 'app/extension/index.html',
    controller: 'ExtensionIndexController',
    trackEvent: 'View Extension'
  }, defaultRouteOptions));

  $routeProvider.when('/search',
    {
      templateUrl: 'app/home/search.html',
      controller: 'SearchController',
      title: 'Search',
      trackEvent: 'View Search',
      reloadOnSearch: true
    }
  );

  $routeProvider.when('/issues/:id', angular.extend({
    templateUrl: 'app/issues/show.html',
    container: false,
    controller: 'IssueShowController',
    trackEvent: 'View Issue'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/backers', angular.extend({
    templateUrl: 'app/issues/backers.html',
    container: false,
    controller: 'IssueBackersController',
    trackEvent: 'View Issue Bounties'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/proposals', angular.extend({
    templateUrl: 'app/issues/proposals.html',
    controller: 'IssueProposalsController',
    resolve: { person: personResolver },
    trackEvent: 'View Issue Proposals'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/unsubscribe', {
    templateUrl: 'app/notifications/unsubscribe.html',
    controller: 'NotificationsController',
    trackEvent: 'View Notifications Unsubscribe'
  });

  $routeProvider.when('/people/:id', angular.extend({
    templateUrl: 'app/people/activity.html',
    controller: 'PeopleShow',
    trackEvent: 'View Person'
  }, defaultRouteOptions));

  $routeProvider.when('/press', angular.extend({
    templateUrl: 'app/press/index.html',
    controller: 'PressController',
    trackEvent: 'View Press'
  }, defaultRouteOptions));

  $routeProvider.when('/settings/accounts', angular.extend({
    templateUrl: 'app/settings/accounts.html',
    controller: 'AccountSettings',
    resolve: { person: personResolver },
    trackEvent: 'View Account Settings'
  }, defaultRouteOptions));

  $routeProvider.when('/settings', angular.extend({
    templateUrl: 'app/settings/profile.html',
    controller: 'Settings',
    resolve: { person: personResolver },
    trackEvent: 'View Account Settings Profile'
  }, defaultRouteOptions));

  $routeProvider.when('/signin/callback', angular.extend({
    controller: 'SigninCallbackController',
    templateUrl: 'app/signin/callback.html',
    trackEvent: false
  }, defaultRouteOptions));

  $routeProvider.when('/signin/reset', angular.extend({
    templateUrl: 'app/signin/reset.html',
    controller: 'Reset',
    trackEvent: 'View Signin Reset'
  }, defaultRouteOptions));

  $routeProvider.when('/signin', angular.extend({
    templateUrl: 'app/signin/signin.html',
    controller: 'SigninController',
    title: 'Sign in',
    trackEvent: 'View Signin'
  }, defaultRouteOptions));

  $routeProvider.when('/verify', angular.extend({
    templateUrl: 'app/signin/verify.html',
    controller: 'VerifyController',
    title: 'Email Verification',
    trackEvent: "Email Verify"
  }, defaultRouteOptions));

  $routeProvider.when('/verify-email', angular.extend({
    templateUrl: 'app/signin/verify_email.html',
    controller: 'VerifyEmailController',
    title: 'Email Change Verification',
    trackEvent: "Email Change Verify"
  }, defaultRouteOptions));

  $routeProvider.when('/tools', angular.extend({
    templateUrl: 'app/tools/all.html',
    controller: 'BaseToolsController',
    reloadOnSearch: false,
    resolve: {
      person: personResolver,
      permissions: function($rootScope) {
        $rootScope.$watch('current_person', function(person) {
          $rootScope.__can_use_plugin__ = person && person.github_account && person.github_account.permissions.indexOf("public_repo") >= 0;
        });
      }
    },
    trackEvent: 'View Tools'
  }, defaultRouteOptions));

  $routeProvider.when('/tools/installed', angular.extend({
    templateUrl: 'app/tools/installed.html',
    controller: 'BaseToolsController',
    reloadOnSearch: false,
    resolve: {
      person: personResolver,
      permissions: function($rootScope) {
        $rootScope.$watch('current_person', function(person) {
          $rootScope.__can_use_plugin__ = person && person.github_account && person.github_account.permissions.indexOf("public_repo") >= 0;
        });
      }
    },
    trackEvent: 'View Tools Installed'
  }, defaultRouteOptions));

  $routeProvider.when('/trackers', angular.extend({
    templateUrl: 'app/trackers/index.html',
    controller: 'TrackersIndex',
    title: 'Projects',
    trackEvent: 'View Trackers'
  }, defaultRouteOptions));

  $routeProvider.when('/trackers/:id', angular.extend({
    templateUrl: 'app/trackers/show.html',
    container: false,
    controller: 'TrackerShow',
    reloadOnSearch: false,
    trackEvent: 'View Tracker'
  }, defaultRouteOptions));

  $routeProvider.otherwise({
    templateUrl: 'app/layout/notFound.html'
  });
});
