'use strict';

var defaultRouteOptions = {
  reloadOnSearch: false
};

angular.module('app.routes').config(function ($routeProvider, personResolver) {
  $routeProvider.when('/', angular.extend({
    templateUrl: 'pages/home/home.html',
    controller: 'HomeCtrl',
    resolve: {
      count: function($rootScope, $api) {
        $rootScope.people_count = $api.people_count();
      }
    }
  }, defaultRouteOptions));

  $routeProvider.when('/faq', angular.extend({
    templateUrl: 'pages/about/faq.html',
    controller: 'StaticPageController',
    title: 'Frequently Asked Questions'
  }, defaultRouteOptions));

  $routeProvider.when('/fees', angular.extend({
    templateUrl: 'pages/about/fees.html',
    controller: 'StaticPageController',
    title: 'Pricing'
  }, defaultRouteOptions));

  $routeProvider.when('/jobs', angular.extend({
    templateUrl: 'pages/about/jobs.html',
    controller: 'StaticPageController',
    title: 'Jobs'
  }, defaultRouteOptions));

  $routeProvider.when('/learn', angular.extend({
    templateUrl: 'pages/about/learn.html',
    controller: 'StaticPageController',
    title: 'Learn'
  }, defaultRouteOptions));

  $routeProvider.when('/privacy', angular.extend({
    templateUrl: 'pages/about/privacy_policy.html',
    controller: 'StaticPageController',
    title: 'Privacy Policy'
  }, defaultRouteOptions));

  $routeProvider.when('/terms', angular.extend({
    templateUrl: 'pages/about/terms.html',
    controller: 'StaticPageController',
    title: 'Terms of Service'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/account', angular.extend({
    templateUrl: 'pages/activity/account.html',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/bounties', angular.extend({
    templateUrl: 'pages/activity/bounties.html',
    controller: 'BountyActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/claims', angular.extend({
    templateUrl: 'pages/activity/bounty_claims.html',
    controller: 'BountyClaimActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/fundraisers', angular.extend({
    templateUrl: 'pages/activity/fundraisers.html',
    controller: 'FundraiserActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/pledges', angular.extend({
    templateUrl: 'pages/activity/pledges.html',
    controller: 'PledgeActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity', angular.extend({
    templateUrl: 'pages/activity/timeline.html',
    controller: 'Activity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/transactions', angular.extend({
    templateUrl: 'pages/activity/transactions.html',
    controller: 'TransactionActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/auth/:provider/confirm', angular.extend({
    templateUrl: "pages/auth/auth.html",
    controller: "AuthConfirmController",
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/bounties/search', angular.extend({
    templateUrl: 'pages/bounties/search.html',
    controller: 'BountiesSearchController'
  }, defaultRouteOptions));

  $routeProvider.when('/cart', angular.extend({
    templateUrl: 'pages/cart/cart.html',
    controller: 'CartController'
  }, defaultRouteOptions));

  $routeProvider.when('/enterprise', angular.extend({
    templateUrl: 'pages/enterprise/index.html',
    controller: 'Static'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/updates/:update_id/edit', angular.extend({
    templateUrl: 'pages/fundraiser_updates/edit.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/updates/:update_id', angular.extend({
    templateUrl: 'pages/fundraiser_updates/show.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/new', angular.extend({
    templateUrl: 'pages/fundraisers/create.html',
    controller: 'FundraiserCreateController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/edit', angular.extend({
    templateUrl: 'pages/fundraisers/edit.html',
    controller: 'FundraiserController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers', angular.extend({
    templateUrl: 'pages/fundraisers/index.html',
    controller: 'FundraisersIndex',
    title: 'Fundraisers'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/completed', angular.extend({
    templateUrl: 'pages/fundraisers/index.html',
    controller: 'FundraisersIndex',
    title: 'Fundraisers'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/backers', angular.extend({
    templateUrl: 'pages/fundraisers/pledges.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/rewards', angular.extend({
    templateUrl: 'pages/fundraisers/rewards.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id', angular.extend({
    templateUrl: 'pages/fundraisers/show.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/updates', angular.extend({
    templateUrl: 'pages/fundraisers/updates.html',
    controller: 'FundraiserUpdatesController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues', angular.extend({
    templateUrl: 'pages/home/newHome.html',
    controller: 'newHomeCtrl'
  }, defaultRouteOptions));

  $routeProvider.when('/search', angular.extend({
    templateUrl: 'pages/home/search.html',
    controller: 'SearchController',
    title: 'Search'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/bounties', angular.extend({
    templateUrl: 'pages/issues/bounties.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/bounty', angular.extend({
    templateUrl: 'pages/issues/bounty.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/claims', angular.extend({
    templateUrl: 'pages/issues/bounty_claims.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/new', angular.extend({
    templateUrl: 'pages/issues/new.html',
    controller: 'IssueCreateController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id', angular.extend({
    templateUrl: 'pages/issues/show.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/cancel_all', angular.extend({
    templateUrl: 'pages/notifications/cancel_all.html',
    controller: 'CancelAllEmailsController'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/unsubscribe', angular.extend({
    templateUrl: 'pages/notifications/unsubscribe.html',
    controller: 'NotificationsController'
  }, defaultRouteOptions));

  $routeProvider.when('/people/:id', angular.extend({
    templateUrl: 'pages/people/activity.html',
    controller: 'PeopleShow'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/pledge', angular.extend({
    templateUrl: 'pages/pledges/new.html',
    controller: 'FundraiserPledgeCreateController'
  }, defaultRouteOptions));

  $routeProvider.when('/press', angular.extend({
    templateUrl: 'pages/press/index.html',
    controller: 'PressController'
  }, defaultRouteOptions));

  $routeProvider.when('/settings/accounts', angular.extend({
    templateUrl: 'pages/settings/accounts.html',
    controller: 'AccountSettings',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/settings/email', angular.extend({
    templateUrl: 'pages/settings/email.html',
    controller: 'SettingsEmail',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/settings', angular.extend({
    templateUrl: 'pages/settings/profile.html',
    controller: 'Settings',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/signin/callback', angular.extend({
    controller: 'SigninCallbackController',
    templateUrl: 'pages/signin/callback.html'
  }, defaultRouteOptions));

  $routeProvider.when('/signin/reset', angular.extend({
    templateUrl: 'pages/signin/reset.html',
    controller: 'Reset'
  }, defaultRouteOptions));

  $routeProvider.when('/signin', angular.extend({
    templateUrl: 'pages/signin/signin.html',
    controller: 'SigninController',
    title: 'Sign in'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/account', angular.extend({
    templateUrl: 'pages/teams/account.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/activity', angular.extend({
    templateUrl: 'pages/teams/activity.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/bounties', angular.extend({
    templateUrl: 'pages/teams/bounties.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams', angular.extend({
    templateUrl: 'pages/teams/index.html',
    controller: 'TeamsIndexController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/issues', angular.extend({
    templateUrl: 'pages/teams/issues.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/join', angular.extend({
    templateUrl: 'pages/teams/join.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/members/manage', angular.extend({
    templateUrl: 'pages/teams/manage_members.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/members', angular.extend({
    templateUrl: 'pages/teams/members.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/new', angular.extend({
    templateUrl: 'pages/teams/new.html',
    controller: 'NewTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/projects', angular.extend({
    templateUrl: 'pages/teams/projects.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/settings', angular.extend({
    templateUrl: 'pages/teams/settings.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id', angular.extend({
    templateUrl: 'pages/teams/show.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/tools', angular.extend({
    templateUrl: 'pages/tools/all.html',
    controller: 'BaseToolsController',
    reloadOnSearch: false,
    resolve: {
      person: personResolver,
      permissions: function($rootScope) {
        $rootScope.$watch('current_person', function(person) {
          $rootScope.__can_use_plugin__ = person && person.github_account && person.github_account.permissions.indexOf("public_repo") >= 0;
        });
      }
    }
  }, defaultRouteOptions));

  $routeProvider.when('/tools/installed', angular.extend({
    templateUrl: 'pages/tools/installed.html',
    controller: 'BaseToolsController',
    reloadOnSearch: false,
    resolve: {
      person: personResolver,
      permissions: function($rootScope) {
        $rootScope.$watch('current_person', function(person) {
          $rootScope.__can_use_plugin__ = person && person.github_account && person.github_account.permissions.indexOf("public_repo") >= 0;
        });
      }
    }
  }, defaultRouteOptions));

  $routeProvider.when('/trackers/:id/edit', angular.extend({
    templateUrl: 'pages/trackers/edit.html',
    controller: 'TrackersEditController',
    title: 'Projects',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/trackers', angular.extend({
    templateUrl: 'pages/trackers/index.html',
    controller: 'TrackersIndex',
    title: 'Projects'
  }, defaultRouteOptions));

  $routeProvider.when('/trackers/:id', angular.extend({
    templateUrl: 'pages/trackers/show.html',
    controller: 'TrackerShow',
    reloadOnSearch: false
  }, defaultRouteOptions));

  $routeProvider.when('/transactions/:id', angular.extend({
    templateUrl: 'pages/transactions/show.html',
    controller: 'TransactionShowController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.otherwise({
    templateUrl: 'pages/layout/not_found.html'
  });
});