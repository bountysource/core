angular.module('teams')
  .config(function($routeProvider, defaultRouteOptions, personResolver) {
    $routeProvider.when('/teams/:id/bounties', angular.extend({
      templateUrl: 'app/teams/bounties.html',
      container: false,
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
      container: false,
      controller: 'BaseTeamController',
      resolve: { person: personResolver },
      trackEvent: 'View Team Join'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/members/manage', angular.extend({
      templateUrl: 'app/teams/manage_members.html',
      container: false,
      controller: 'BaseTeamController',
      resolve: { person: personResolver },
      trackEvent: 'View Team Members Manage'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/members', angular.extend({
      templateUrl: 'app/teams/members.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Members'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/tagged', angular.extend({
      templateUrl: 'app/teams/tagged.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Tagged'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/new', angular.extend({
      templateUrl: 'app/teams/new.html',
      controller: 'NewTeamController',
      container: false,
      resolve: { person: personResolver },
      trackEvent: 'View Team Create'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/projects/manage', angular.extend({
      templateUrl: 'app/teams/manage_projects.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Manage Projects',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/projects', {
      redirectTo: function(param) { return "/teams/"+param.id; }
    });

    $routeProvider.when('/teams/:id/settings', angular.extend({
      templateUrl: 'app/teams/settings.html',
      container: false,
      controller: 'BaseTeamController',
      resolve: { person: personResolver },
      trackEvent: 'View Team Settings'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id', angular.extend({
      templateUrl: 'app/teams/show.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraiser', angular.extend({
      templateUrl: 'app/teams/fundraiser.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraisers', angular.extend({
      templateUrl: 'app/fundraisers/manage.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraisers Index'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/fundraisers/:fundraiser_id/edit', angular.extend({
      templateUrl: 'app/fundraisers/edit.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser Edit'
    }, defaultRouteOptions));

    // legacy route, needs to be ahead of similar route below
    $routeProvider.when('/teams/:id/fundraisers/new', { controller: function($window) { $window.location.replace('https://salt.bountysource.com/'); }, template: "" });
    $routeProvider.when('/teams/:id/fundraisers/:fundraiser_id', angular.extend({
      templateUrl: 'app/fundraisers/show.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Fundraiser Show'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/backers', angular.extend({
      templateUrl: 'app/teams/backers.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Backers'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/suggested_issues', angular.extend({
      templateUrl: 'app/teams/suggested_issues.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Suggested Issues'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/issues', angular.extend({
      templateUrl: 'app/teams/issues.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Issues'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/updates', angular.extend({
      templateUrl: 'app/teams/updates.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Updates'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/updates/new', angular.extend({
      templateUrl: 'app/teams/update_new.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team New Update'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/updates/:update_id', angular.extend({
      templateUrl: 'app/teams/update.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Update'
    }, defaultRouteOptions));

    $routeProvider.when('/teams/:id/rewards', angular.extend({
      templateUrl: 'app/teams/rewards.html',
      container: false,
      controller: 'BaseTeamController',
      trackEvent: 'View Team Rewards'
    }, defaultRouteOptions));
  });
