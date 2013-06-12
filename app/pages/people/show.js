'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id', {
        templateUrl: 'pages/people/show.html',
        controller: 'PeopleShow'
      });
  })
  .controller('PeopleShow', function ($scope, $routeParams, $api) {
    $scope.person = $api.person_get($routeParams.id);
  });

