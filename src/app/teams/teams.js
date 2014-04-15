'use strict';

angular.module('teams')
  .config(function($routeProvider, defaultRouteOptions, personResolver) {
    $routeProvider.when('/teams/:id/account', angular.extend({
      templateUrl: 'app/teams/account.html',
      controller: 'BaseTeamController',
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

    $routeProvider.when('/teams/:id/projects/manage', angular.extend({
      templateUrl: 'app/teams/manage_projects.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Manage Projects',
      resolve: { person: personResolver }
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

    $routeProvider.when('/teams/:id/fundraiser', angular.extend({
      templateUrl: 'app/teams/fundraiser.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraisers', angular.extend({
      templateUrl: 'app/fundraisers/manage.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraisers Index'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraisers/new', angular.extend({
      templateUrl: 'app/fundraisers/new.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser New'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraisers/:fundraiser_id/edit', angular.extend({
      templateUrl: 'app/fundraisers/edit.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser Edit'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraisers/:fundraiser_id', angular.extend({
      templateUrl: 'app/fundraisers/show.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser Show'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/backers', angular.extend({
      templateUrl: 'app/teams/backers.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Backers'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/suggested_issues', angular.extend({
      templateUrl: 'app/teams/suggested_issues.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Suggested Issues'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/issues', angular.extend({
      templateUrl: 'app/teams/issues.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Issues'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/updates', angular.extend({
      templateUrl: 'app/teams/updates.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Updates'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/updates/:update_id', angular.extend({
      templateUrl: 'app/teams/update.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Update'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/rewards', angular.extend({
      templateUrl: 'app/teams/rewards.html',
      controller: 'BaseTeamController',
      trackEvent: 'View Team Rewards'
    }, defaultRouteOptions));
  });
