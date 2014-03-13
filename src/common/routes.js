'use strict';

angular.module('app').config(function ($routeProvider, defaultRouteOptions, personResolver) {
  $routeProvider.when('/', angular.extend({
    templateUrl: 'app/home/home.html',
    controller: 'HomeCtrl',
    trackEvent: 'View Homepage',
    resolve: {
      count: function($rootScope, $api) {
        $rootScope.people_count = $api.people_count();
      }
    }
  }, defaultRouteOptions));

  $routeProvider.when('/faq', angular.extend({
    templateUrl: 'app/about/faq.html',
    controller: 'StaticPageController',
    title: 'Frequently Asked Questions',
    trackEvent: 'View FAQ'
  }, defaultRouteOptions));

  $routeProvider.when('/fees', angular.extend({
    templateUrl: 'app/about/fees.html',
    controller: 'StaticPageController',
    title: 'Pricing',
    trackEvent: 'View Pricing'
  }, defaultRouteOptions));

  $routeProvider.when('/jobs', angular.extend({
    templateUrl: 'app/about/jobs.html',
    controller: 'StaticPageController',
    title: 'Jobs',
    trackEvent: 'View Jobs'
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

  $routeProvider.when('/activity/account', angular.extend({
    templateUrl: 'app/activity/account.html',
    resolve: { person: personResolver },
    trackEvent: 'View My Account'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/bounties', angular.extend({
    templateUrl: 'app/activity/bounties.html',
    controller: 'BountyActivity',
    resolve: { person: personResolver },
    trackEvent: 'View My Bounties'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/claims', angular.extend({
    templateUrl: 'app/activity/bounty_claims.html',
    controller: 'BountyClaimActivity',
    resolve: { person: personResolver },
    trackEvent: 'View My Claims'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/fundraisers', angular.extend({
    templateUrl: 'app/activity/fundraisers.html',
    controller: 'FundraiserActivity',
    resolve: { person: personResolver },
    trackEvent: 'View My Fundraisers'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/pledges', angular.extend({
    templateUrl: 'app/activity/pledges.html',
    controller: 'PledgeActivity',
    resolve: { person: personResolver },
    trackEvent: 'View My Pledges'
  }, defaultRouteOptions));

  $routeProvider.when('/activity', angular.extend({
    templateUrl: 'app/activity/timeline.html',
    controller: 'Activity',
    resolve: { person: personResolver },
    trackEvent: 'View My Timeline'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/transactions', angular.extend({
    templateUrl: 'app/activity/transactions.html',
    controller: 'TransactionActivity',
    resolve: { person: personResolver },
    trackEvent: 'View My Transactions'
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
    controller: 'CartController',
    trackEvent: 'View Cart'
  }, defaultRouteOptions));

  $routeProvider.when('/enterprise', angular.extend({
    templateUrl: 'app/enterprise/index.html',
    controller: 'StaticPageController',
    trackEvent: 'View Enterprise'
  }, defaultRouteOptions));

  $routeProvider.when('/issues', angular.extend({
    templateUrl: 'app/home/newHome.html',
    controller: 'newHomeCtrl',
    trackEvent: 'View Issues'
  }, defaultRouteOptions));

  $routeProvider.when('/search', angular.extend({
    templateUrl: 'app/home/search.html',
    controller: 'SearchController',
    title: 'Search',
    trackEvent: 'View Search'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/bounties', angular.extend({
    templateUrl: 'app/issues/bounties.html',
    controller: 'IssuesBaseController',
    trackEvent: 'View Issue Bounties'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/bounty', angular.extend({
    templateUrl: 'app/issues/bounty.html',
    controller: 'IssuesBaseController',
    trackEvent: 'View Bounty Create'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/claims', angular.extend({
    templateUrl: 'app/issues/bounty_claims.html',
    controller: 'IssuesBaseController',
    trackEvent: 'View Issue Claims'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/new', angular.extend({
    templateUrl: 'app/issues/new.html',
    controller: 'IssueCreateController',
    trackEvent: 'View Issue Create'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id', angular.extend({
    templateUrl: 'app/issues/show.html',
    controller: 'IssuesBaseController',
    trackEvent: 'View Issue'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/cancel_all', angular.extend({
    templateUrl: 'app/notifications/cancel_all.html',
    controller: 'CancelAllEmailsController',
    trackEvent: 'View Notifications Cancel All'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/unsubscribe', angular.extend({
    templateUrl: 'app/notifications/unsubscribe.html',
    controller: 'NotificationsController',
    trackEvent: 'View Notifications Unsubscribe'
  }, defaultRouteOptions));

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

  $routeProvider.when('/settings/email', angular.extend({
    templateUrl: 'app/settings/email.html',
    controller: 'SettingsEmail',
    resolve: { person: personResolver },
    trackEvent: 'View Account Settings Email'
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

  $routeProvider.when('/teams/:id/account', angular.extend({
    templateUrl: 'app/teams/account.html',
    controller: 'BaseTeamController',
    resolve: { person: personResolver },
    trackEvent: 'View Team Account'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/activity', angular.extend({
    templateUrl: 'app/teams/activity.html',
    controller: 'BaseTeamController',
    trackEvent: 'View Team Activity'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/bounties', angular.extend({
    templateUrl: 'app/teams/bounties.html',
    controller: 'BaseTeamController',
    trackEvent: 'View Team Bounties'
  }, defaultRouteOptions));

  $routeProvider.when('/teams', angular.extend({
    templateUrl: 'app/teams/index.html',
    controller: 'TeamsIndexController',
    trackEvent: 'View Teams'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/issues', angular.extend({
    templateUrl: 'app/teams/issues.html',
    controller: 'BaseTeamController',
    trackEvent: 'View Team Issues'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/join', angular.extend({
    templateUrl: 'app/teams/join.html',
    controller: 'BaseTeamController',
    resolve: { person: personResolver },
    trackEvent: 'View Team Join'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/members/manage', angular.extend({
    templateUrl: 'app/teams/manage_members.html',
    controller: 'BaseTeamController',
    resolve: { person: personResolver },
    trackEvent: 'View Team Members Manage'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/members', angular.extend({
    templateUrl: 'app/teams/members.html',
    controller: 'BaseTeamController',
    trackEvent: 'View Team Members'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/new', angular.extend({
    templateUrl: 'app/teams/new.html',
    controller: 'NewTeamController',
    resolve: { person: personResolver },
    trackEvent: 'View Team Create'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/projects', angular.extend({
    templateUrl: 'app/teams/projects.html',
    controller: 'BaseTeamController',
    trackEvent: 'View Team Projects'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/settings', angular.extend({
    templateUrl: 'app/teams/settings.html',
    controller: 'BaseTeamController',
    resolve: { person: personResolver },
    trackEvent: 'View Team Settings'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id', angular.extend({
    templateUrl: 'app/teams/show.html',
    controller: 'BaseTeamController',
    trackEvent: 'View Team'
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

  $routeProvider.when('/trackers/:id/edit', angular.extend({
    templateUrl: 'app/trackers/edit.html',
    controller: 'TrackersEditController',
    title: 'Projects',
    resolve: { person: personResolver },
    trackEvent: 'View Tracker Edit'
  }, defaultRouteOptions));

  $routeProvider.when('/trackers', angular.extend({
    templateUrl: 'app/trackers/index.html',
    controller: 'TrackersIndex',
    title: 'Projects',
    trackEvent: 'View Trackers'
  }, defaultRouteOptions));

  $routeProvider.when('/trackers/:id', angular.extend({
    templateUrl: 'app/trackers/show.html',
    controller: 'TrackerShow',
    reloadOnSearch: false,
    trackEvent: 'View Tracker'
  }, defaultRouteOptions));

  $routeProvider.when('/transactions/:id', angular.extend({
    templateUrl: 'app/transactions/show.html',
    controller: 'TransactionShowController',
    resolve: { person: personResolver },
    trackEvent: 'View Transaction'
  }, defaultRouteOptions));

  $routeProvider.otherwise({
    templateUrl: 'app/layout/notFound.html'
  });
});
