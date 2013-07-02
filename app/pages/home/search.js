'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/search', {
        templateUrl: 'pages/home/search.html',
        controller: 'SearchController'
      });
  })

  .controller('NavbarSearchController', function ($scope, $location) {
    $scope.search_query = null;
    $scope.submit_search = function() {
      console.log('search submit!');
      if ($scope.search_query && $scope.search_query.length > 0) {
        $location.path("/search").search({ query: $scope.search_query });
      }
    };
  })

  .controller('SearchController', function ($scope, $location, $routeParams, $api) {
    $scope.search_pending = true;

    if ($routeParams.query) {
      $api.search($routeParams.query).then(function(results) {
        $scope.search_pending = false;
        $scope.results = results;
      });
    }
  });
