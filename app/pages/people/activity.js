'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id', {
        templateUrl: 'pages/people/activity.html',
        controller: 'PeopleShow'
      });
  })
  .controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle, $location) {
    if ((/^18483-/).test($routeParams.id)) {
      $location.url("/teams/bountysource").replace();
    }

    $scope.person = $api.person_get($routeParams.id);

    $scope.person.then(function(person){
      person.display_name = person.display_name.replace(/\(unknown\)/g, '').trim();
      $pageTitle.set(person.display_name, 'Profile');
    });

    $scope.timeline = $api.person_activity($routeParams.id);

    $scope.teams = $api.person_teams_get($routeParams.id);
  });

