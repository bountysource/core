'use strict';

angular.module('app.controllers').controller('TeamsIndexController', ['$scope', '$location', '$api', '$pageTitle', function ($scope, $location, $api, $pageTitle) {
  $pageTitle.set("Teams");

  $api.featured_teams().then(function(teams) {
    $scope.teams = teams;
    return teams;
  });
}]);
