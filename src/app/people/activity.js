'use strict';

angular.module('app').controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle, $location) {
  if ((/^18483-/).test($routeParams.id)) {
    $location.url("/teams/bountysource").replace();
  }

  $api.person_get($routeParams.id).then(function(person) {
    $pageTitle.set(person.display_name, 'Profile');

    person.display_name = person.display_name.replace(/\(unknown\)/g, '').trim();

    $scope.person = person;
    return person;
  });

  $api.person_activity($routeParams.id).then(function(timeline) {
    $scope.timeline = timeline;
    return timeline;
  });

  $api.person_teams_get($routeParams.id).then(function(teams) {
    $scope.teams = teams;
    return teams;
  });
});
