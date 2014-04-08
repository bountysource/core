'use strict';

angular.module('app').
  config(function($routeProvider, defaultRouteOptions, personResolver) {

    $routeProvider.when('/events', angular.extend({
      templateUrl: 'app/events/index.html',
      controller: 'EventIndexController',
      trackEvent: 'View Events Index'
    }, defaultRouteOptions));

    $routeProvider.when('/events/new', angular.extend({
      templateUrl: 'app/events/new.html',
      controller: 'NewEventController',
      trackEvent: 'View Events Index',
      resolve: { person: personResolver }
    }, defaultRouteOptions));

    $routeProvider.when('/events/:slug', angular.extend({
      templateUrl: 'app/events/show.html',
      controller: 'EventShowController',
      trackEvent: 'View Events Index'
    }, defaultRouteOptions));

    $routeProvider.when('/events/:slug/edit', angular.extend({
      templateUrl: 'app/events/edit.html',
      controller: 'EditEventController',
      trackEvent: 'View Events Index'
    }, defaultRouteOptions));

  });
