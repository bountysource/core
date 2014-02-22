'use strict';

angular.module('app').controller('TeamsIndexController', function ($scope, $location, $api, $pageTitle) {
  $pageTitle.set("Teams");

  $api.featured_teams().then(function(teams) {
    $scope.teams = teams;
    return teams;
  });
});
