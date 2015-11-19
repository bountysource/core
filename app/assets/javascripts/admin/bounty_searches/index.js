'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/searches/bounty', {
        templateUrl: 'admin/bounty_searches/index.html',
        controller: "BountySearchesController"
      });
  })
  .controller("BountySearchesController", function ($scope, $api) {
    $scope.searches = $api.bounty_searches_get().then(function(searches) {
      for (var i=0; i<searches.length; i++) {
        // Need to parse languages and trackers
        searches[i].params.languages = JSON.parse(searches[i].params.languages || "[]");
        searches[i].params.trackers = JSON.parse(searches[i].params.trackers || "[]");
      }

      return searches;
    });
  });