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
    $scope.person = $api.person_get($routeParams.id);

    $scope.person.then(function(person){
      $pageTitle.set(person.display_name, 'Profile');

      // revolting hack to redirect to Team page instead of Person page.
      if (person.id === 19571) {
        $location.path("/teams/mozilla/activity").replace();
      } else if (person.id === 18619) {
        $location.path("/teams/adobe/activity").replace();
      } else if (person.id === 19091) {
        $location.path("/teams/gust/activity").replace();
      } else if (person.id === 17691) {
        $location.path("/teams/uber/activity").replace();
      }
    });

    $scope.timeline = $api.person_activity($routeParams.id);
  });

