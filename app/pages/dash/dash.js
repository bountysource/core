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
  var favLang = ['ruby', 'java', 'clojure'];

  $scope.person = $api.person_get($scope.current_person.id);
  $scope.teams = $api.person_teams_get($scope.current_person.id);

  $scope.issues = $api.search(favLang[0]).then(function(data) {
    return data.issues.slice(0,3);
  });

  $scope.installed = $api.call("/tracker_plugins", {per_page: 3}).then(function(data) {
    console.log(data);
  });

  $scope.projects = $api.call("/projects", {per_page: 3}).then(function(data) {
    console.log(data);
  });

  $scope.myBugs = {
    issue1: {
      project: "Ruby on Rails",
      title: "Including ActionController::Live causes a controller to swallow all errors and return 200 always",
      url: "/issues/866811-including-actioncontroller-live-causes-a-controller-to-swallow-all-errors-and-return-200-always"
    },
    issue2: {
      project: "Ruby on Rails",
      title: "Major performance regression when preloading has_many_through association",
      url: "/issues/866819-major-performance-regression-when-preloading-has_many_through-association"
    },
    issue3: {
      project: "Ruby on Rails",
      title: "Serialized attributes always get marked as changed by ActiveModel::Dirty in new record",
      url: "/issues/866827-serialized-attributes-always-get-marked-as-changed-by-activemodel-dirty-in-new-record"
    }
  };
});
