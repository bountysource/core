'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl'
      });
  })
  .controller('HomeCtrl', function ($scope, $window, $api) {
    $scope.fundraisers = $api.fundraiser_cards();

    $scope.show_developers_type = 'top';
    $scope.show_backers_type = 'top';

    // $scope.recent_people = $api.people_recent();
    $api.people_interesting().then(function(people) {
      console.log(people);
      $scope.people = people;
    });

    $scope.trackers = $api.project_cards();

    // poll until twitter loaded, then load the widget!
    var poll = setInterval(function() {
      if (angular.isDefined($window.twttr)) {
        clearInterval(poll);
        $window.twttr.widgets.load();
      }
    }, 50);
  });
