'use strict';

angular.module('app.legacyRoutes', ['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        redirectTo: "/learn",
        controller: 'StaticPageController'
      })
      .when('/account', {
        redirectTo: "/settings",
        controller: 'StaticPageController'
      })
      .when('/account/forgot_password', {
        redirectTo: "/signin/reset",
        controller: 'StaticPageController'
      })
      .when('/account/change_password', {
        redirectTo: "/settings/accounts",
        controller: 'StaticPageController'
      })
      .when('/projects', {
        redirectTo: "/tools",
        controller: 'StaticPageController'
      })
      .when('/tools', {
        redirectTo: "/tools",
        controller: 'StaticPageController'
      })
      .when('/users/:id', {
        redirectTo: function(param) { return "/people/"+param.id; },
        controller: 'StaticPageController'
      })
      .when('/trackers/:id/issues', {
        redirectTo: function(param) { return "/trackers/"+param.id; },
        controller: 'StaticPageController'
      })
      .when('/issues/:issue_id/bounties/:id/receipt', {
        redirectTo: function() { return "/activity/bounties"; },
        controller: 'StaticPageController'
      })
      .when('/issues/:issue_id/solutions/:id/disputes/create', {
        redirectTo: function(param) { return "/issues/"+param.issue_id+"/solutions"; },
        controller: 'StaticPageController'
      })
      .when('/issues/:issue_id/solutions/:id/disputes', {
        redirectTo: function(param) { return "/issues/"+param.issue_id+"/solutions"; },
        controller: 'StaticPageController'
      })
      .when('/issues/:issue_id/comments', {
        redirectTo: function(param) { return "/issues/"+param.issue_id; },
        controller: 'StaticPageController'
      })
      .when('/solutions', {
        redirectTo: "/activity/solutions",
        controller: 'StaticPageController'
      })
      .when('/solutions/:id', {
        redirectTo: function() { return "/activity/solutions"; },
        controller: 'StaticPageController'
      })
      .when('/contributions', {
        redirectTo: "/activity",
        controller: 'StaticPageController'
      })
      .when('/termsofservice', {
        redirectTo: "/terms",
        controller: 'StaticPageController'
      })
      .when('/privacypolicy', {
        redirectTo: "/privacy",
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/edit/basic-info', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/edit/description', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/edit/description', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/edit/rewards', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/edit/funding', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/edit/duration', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/account/fundraiser', {
        redirectTo: "/activity/fundraiser",
        controller: 'StaticPageController'
      })
      .when('/account/create_fundraiser', {
        redirectTo: "/fundraiser/new",
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:fundraiser_id/pledges/:id', {
        redirectTo: function() { return "/activity/pledges"; },
        controller: 'StaticPageController'
      })
      .when('/fundraiser/:id/info', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/rewards"; },
        controller: 'StaticPageController'
      })
      .when('/undefined', {
        redirectTo: "/",
        controller: 'StaticPageController'
      })
      .when('/account/fundraiser/:id/basic_info', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/account/fundraiser/:id/description', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/account/fundraiser/:id/rewards', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/account/fundraiser/:id/funding', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/account/fundraiser/:id/duration', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/edit"; },
        controller: 'StaticPageController'
      })
      .when('/bounties', {
        redirectTo: "/bounties/search",
        controller: 'StaticPageController'
      })
      .when('/create_account', {
        redirectTo: "/signin",
        controller: 'StaticPageController'
      })
      .when('/activity/solutions', {
        redirectTo: "/activity/claims",
        controller: 'StaticPageController'
      }).when('/fundraiser/:id/pledges', {
        redirectTo: function(param) { return "/fundraiser/"+param.id+"/backers"; },
        controller: 'StaticPageController'
      }).when('/issues/:issue_id/solutions', {
        redirectTo: function(params) { return "/issues/"+params.issue_id+"/claims"; }
      });
  });
