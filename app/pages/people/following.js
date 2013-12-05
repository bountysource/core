'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id/following', {
        templateUrl: 'pages/people/following.html',
        controller: 'PeopleFollowing'
      });
  })
  .controller('PeopleFollowing', function ($scope, $routeParams, $api) {
    $api.person_get($routeParams.id).then(function(person) {
      $scope.person = person;
      return person;
    });

    $scope.timeline = $api.person_timeline_get($routeParams.id).then(function(response) {
      console.log(response);
      return response;
    });
  });

