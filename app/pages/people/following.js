'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/people/:id/following', {
        templateUrl: 'pages/people/following.html',
        controller: 'PeopleFollowing',
        trackEvent: 'View Person Following'
      });
  })
  .controller('PeopleFollowing', function ($scope, $routeParams, $api) {
    $scope.person = $api.person_get($routeParams.id);

    $scope.timeline = $api.person_timeline_get($routeParams.id).then(function(response) {
      console.log(response);
      return response;
    });
  });

