angular.module('app').controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle, $location, Timeline) {
  if ((/^18483-/).test($routeParams.id)) {
    $location.url("/teams/bountysource").replace();
  }

  $api.person_get($routeParams.id).then(function(person) {
    $pageTitle.set(person.display_name, 'Profile');

    person.display_name = person.display_name.replace(/\(unknown\)/g, '').trim();

    $scope.person = person;
    return person;
  });

  $scope.events = Timeline.query({ per_page: 10, person_id: $routeParams.id });

  $api.person_teams($routeParams.id).then(function(teams) {
    $scope.teams = teams;
    return teams;
  });
});
