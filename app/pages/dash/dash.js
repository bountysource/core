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
  //supposed to be some sort of api response
  var favLang = ['ruby', 'java', 'clojure']

  $scope.person = $api.person_get($scope.current_person.id);
  $scope.teams = $api.person_teams_get($scope.current_person.id);

  $scope.issues = $api.search(favLang[0]).then(function(data) {
    return data.issues.slice(0,3)
  });
});
