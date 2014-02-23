'use strict';

var defaultRouteOptions = {
  reloadOnSearch: false
};

angular.module('app').config(function ($routeProvider, personResolver) {
  $routeProvider.when('/', angular.extend({
    templateUrl: 'app/home/home.html',
    controller: 'HomeCtrl',
    resolve: {
      count: function($rootScope, $api) {
        $rootScope.people_count = $api.people_count();
      }
    }
  }, defaultRouteOptions));

  $routeProvider.when('/faq', angular.extend({
    templateUrl: 'app/about/faq.html',
    controller: 'StaticPageController',
    title: 'Frequently Asked Questions'
  }, defaultRouteOptions));

  $routeProvider.when('/fees', angular.extend({
    templateUrl: 'app/about/fees.html',
    controller: 'StaticPageController',
    title: 'Pricing'
  }, defaultRouteOptions));

  $routeProvider.when('/jobs', angular.extend({
    templateUrl: 'app/about/jobs.html',
    controller: 'StaticPageController',
    title: 'Jobs'
  }, defaultRouteOptions));

  $routeProvider.when('/learn', angular.extend({
    templateUrl: 'app/about/learn.html',
    controller: 'StaticPageController',
    title: 'Learn'
  }, defaultRouteOptions));

  $routeProvider.when('/privacy', angular.extend({
    templateUrl: 'app/about/privacy_policy.html',
    controller: 'StaticPageController',
    title: 'Privacy Policy'
  }, defaultRouteOptions));

  $routeProvider.when('/terms', angular.extend({
    templateUrl: 'app/about/terms.html',
    controller: 'StaticPageController',
    title: 'Terms of Service'
  }, defaultRouteOptions));

  $routeProvider.when('/activity/account', angular.extend({
    templateUrl: 'app/activity/account.html',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/bounties', angular.extend({
    templateUrl: 'app/activity/bounties.html',
    controller: 'BountyActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/claims', angular.extend({
    templateUrl: 'app/activity/bounty_claims.html',
    controller: 'BountyClaimActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/fundraisers', angular.extend({
    templateUrl: 'app/activity/fundraisers.html',
    controller: 'FundraiserActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/pledges', angular.extend({
    templateUrl: 'app/activity/pledges.html',
    controller: 'PledgeActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity', angular.extend({
    templateUrl: 'app/activity/timeline.html',
    controller: 'Activity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/activity/transactions', angular.extend({
    templateUrl: 'app/activity/transactions.html',
    controller: 'TransactionActivity',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/auth/:provider/confirm', angular.extend({
    templateUrl: "app/auth/auth.html",
    controller: "AuthConfirmController",
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/bounties/search', angular.extend({
    templateUrl: 'app/bounties/search.html',
    controller: 'BountiesSearchController'
  }, defaultRouteOptions));

  $routeProvider.when('/cart', angular.extend({
    templateUrl: 'app/cart/cart.html',
    controller: 'CartController'
  }, defaultRouteOptions));

  $routeProvider.when('/enterprise', angular.extend({
    templateUrl: 'app/enterprise/index.html',
    controller: 'StaticPageController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/updates/:update_id/edit', angular.extend({
    templateUrl: 'app/fundraiser_updates/edit.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/updates/:update_id', angular.extend({
    templateUrl: 'app/fundraiser_updates/show.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/new', angular.extend({
    templateUrl: 'app/fundraisers/create.html',
    controller: 'FundraiserCreateController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/edit', angular.extend({
    templateUrl: 'app/fundraisers/edit.html',
    controller: 'FundraiserController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers', angular.extend({
    templateUrl: 'app/fundraisers/index.html',
    controller: 'FundraisersIndex',
    title: 'Fundraisers'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/completed', angular.extend({
    templateUrl: 'app/fundraisers/index.html',
    controller: 'FundraisersIndex',
    title: 'Fundraisers'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/backers', angular.extend({
    templateUrl: 'app/fundraisers/pledges.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/rewards', angular.extend({
    templateUrl: 'app/fundraisers/rewards.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id', angular.extend({
    templateUrl: 'app/fundraisers/show.html',
    controller: 'FundraiserController'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/updates', angular.extend({
    templateUrl: 'app/fundraisers/updates.html',
    controller: 'FundraiserUpdatesController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues', angular.extend({
    templateUrl: 'app/home/newHome.html',
    controller: 'newHomeCtrl'
  }, defaultRouteOptions));

  $routeProvider.when('/search', angular.extend({
    templateUrl: 'app/home/search.html',
    controller: 'SearchController',
    title: 'Search'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/bounties', angular.extend({
    templateUrl: 'app/issues/bounties.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/bounty', angular.extend({
    templateUrl: 'app/issues/bounty.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id/claims', angular.extend({
    templateUrl: 'app/issues/bounty_claims.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/new', angular.extend({
    templateUrl: 'app/issues/new.html',
    controller: 'IssueCreateController'
  }, defaultRouteOptions));

  $routeProvider.when('/issues/:id', angular.extend({
    templateUrl: 'app/issues/show.html',
    controller: 'IssuesBaseController'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/cancel_all', angular.extend({
    templateUrl: 'app/notifications/cancel_all.html',
    controller: 'CancelAllEmailsController'
  }, defaultRouteOptions));

  $routeProvider.when('/notifications/unsubscribe', angular.extend({
    templateUrl: 'app/notifications/unsubscribe.html',
    controller: 'NotificationsController'
  }, defaultRouteOptions));

  $routeProvider.when('/people/:id', angular.extend({
    templateUrl: 'app/people/activity.html',
    controller: 'PeopleShow'
  }, defaultRouteOptions));

  $routeProvider.when('/fundraisers/:id/pledge', angular.extend({
    templateUrl: 'app/fundraisers/pledge.html',
    controller: 'FundraiserPledgeCreateController'
  }, defaultRouteOptions));

  $routeProvider.when('/press', angular.extend({
    templateUrl: 'app/press/index.html',
    controller: 'PressController'
  }, defaultRouteOptions));

  $routeProvider.when('/settings/accounts', angular.extend({
    templateUrl: 'app/settings/accounts.html',
    controller: 'AccountSettings',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/settings/email', angular.extend({
    templateUrl: 'app/settings/email.html',
    controller: 'SettingsEmail',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/settings', angular.extend({
    templateUrl: 'app/settings/profile.html',
    controller: 'Settings',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/signin/callback', angular.extend({
    controller: 'SigninCallbackController',
    templateUrl: 'app/signin/callback.html'
  }, defaultRouteOptions));

  $routeProvider.when('/signin/reset', angular.extend({
    templateUrl: 'app/signin/reset.html',
    controller: 'Reset'
  }, defaultRouteOptions));

  $routeProvider.when('/signin', angular.extend({
    templateUrl: 'app/signin/signin.html',
    controller: 'SigninController',
    title: 'Sign in'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/account', angular.extend({
    templateUrl: 'app/teams/account.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/activity', angular.extend({
    templateUrl: 'app/teams/activity.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/bounties', angular.extend({
    templateUrl: 'app/teams/bounties.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams', angular.extend({
    templateUrl: 'app/teams/index.html',
    controller: 'TeamsIndexController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/issues', angular.extend({
    templateUrl: 'app/teams/issues.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/join', angular.extend({
    templateUrl: 'app/teams/join.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/members/manage', angular.extend({
    templateUrl: 'app/teams/manage_members.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/members', angular.extend({
    templateUrl: 'app/teams/members.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/new', angular.extend({
    templateUrl: 'app/teams/new.html',
    controller: 'NewTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/projects', angular.extend({
    templateUrl: 'app/teams/projects.html',
    controller: 'BaseTeamController'
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id/settings', angular.extend({
    templateUrl: 'app/teams/settings.html',
    controller: 'BaseTeamController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/teams/:id', angular.extend({
    templateUrl: 'app/teams/show.html',
    controller: 'BaseTeamController'
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
    }
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
    }
  }, defaultRouteOptions));

  $routeProvider.when('/trackers/:id/edit', angular.extend({
    templateUrl: 'app/trackers/edit.html',
    controller: 'TrackersEditController',
    title: 'Projects',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.when('/trackers', angular.extend({
    templateUrl: 'app/trackers/index.html',
    controller: 'TrackersIndex',
    title: 'Projects'
  }, defaultRouteOptions));

  $routeProvider.when('/trackers/:id', angular.extend({
    templateUrl: 'app/trackers/show.html',
    controller: 'TrackerShow',
    reloadOnSearch: false
  }, defaultRouteOptions));

  $routeProvider.when('/transactions/:id', angular.extend({
    templateUrl: 'app/transactions/show.html',
    controller: 'TransactionShowController',
    resolve: {
      person: personResolver
    }
  }, defaultRouteOptions));

  $routeProvider.otherwise({
    templateUrl: 'app/layout/notFound.html'
  });
});