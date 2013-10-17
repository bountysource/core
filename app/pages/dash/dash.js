'use strict';

angular.module('app')
  .config(function($routeProvider, $person) {
    $routeProvider
    .when('/suchwowdashboard', {
      templateUrl: 'pages/dash/dash.html',
      controller: 'Dash',
      resolve: $person
  });
})

.controller('Dash', function($scope, $location, $api) {
  $scope.person = $api.person_get($scope.current_person.id);
  $scope.teams = $api.person_teams_get($scope.current_person.id);
  console.log('wow');
  console.log($scope.current_person);
});
