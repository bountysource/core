'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        redirectTo: "/learn",
        controller: 'Static'
      })
      .when('/account', {
        redirectTo: "/settings",
        controller: 'Static'
      })
      .when('/account/forgot_password', {
        redirectTo: "/signin/reset",
        controller: 'Static'
      })
      .when('/account/change_password', {
        redirectTo: "/settings/accounts",
        controller: 'Static'
      })
      .when('/projects', {
        redirectTo: "/tools",
        controller: 'Static'
      })
      .when('/tools', {
        redirectTo: "/",
        controller: 'Static'
      })
      .when('/users/:id', {
        redirectTo: function(param) { return "/people/"+param.id; },
        controller: 'Static'
      })
      .when('/trackers/:id/issues', {
        redirectTo: function(param) { return "/trackers/"+param.id; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/bounties/:id/receipt', {
        redirectTo: function() { return "/activity/bounties"; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/solutions/:id/disputes/create', {
        redirectTo: function(param) { return "/issues/"+param.issue_id+"/solutions"; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/solutions/:id/disputes', {
        redirectTo: function(param) { return "/issues/"+param.issue_id+"/solutions"; },
        controller: 'Static'
      })
      .when('/issues/:issue_id/comments', {
        redirectTo: function(param) { return "/issues/"+param.issue_id; },
        controller: 'Static'
      })
      .when('/solutions', {
        redirectTo: "/activity/solutions",
        controller: 'Static'
      })
      .when('/solutions/:id', {
        redirectTo: function() { return "/activity/solutions"; },
        controller: 'Static'
      })
      .when('/contributions', {
        redirectTo: "/activity",
        controller: 'Static'
      })
      .when('/termsofservice', {
        redirectTo: "/terms",
        controller: 'Static'
      })
      .when('/privacypolicy', {
        redirectTo: "/privacy",
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/basic-info', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/description', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/description', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/rewards', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/funding', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/edit/duration', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers', {
        redirectTo: "/activity/fundraisers",
        controller: 'Static'
      })
      .when('/account/create_fundraiser', {
        redirectTo: "/fundraisers/new",
        controller: 'Static'
      })
      .when('/fundraisers/:fundraiser_id/pledges/:id', {
        redirectTo: function() { return "/activity/pledges"; },
        controller: 'Static'
      })
      .when('/fundraisers/:id/info', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/rewards"; },
        controller: 'Static'
      })
      .when('/undefined', {
        redirectTo: "/",
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/basic_info', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/description', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/rewards', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/funding', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/account/fundraisers/:id/duration', {
        redirectTo: function(param) { return "/fundraisers/"+param.id+"/edit"; },
        controller: 'Static'
      })
      .when('/bounties', {
        redirectTo: "/",
        controller: 'Static'
      })
      .when('/create_account', {
        redirectTo: "/signin",
        controller: 'Static'
      })
      .when('/activity/solutions', {
        redirectTo: "/activity/claims",
        controller: 'Static'
      });
  });
