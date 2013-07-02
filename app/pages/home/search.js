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
    $scope.search_query = $routeParams.query;
    $scope.search_pending = true;

    if ($routeParams.query) {
      $api.search($routeParams.query).then(function(results) {
        $scope.search_pending = false;
        $scope.results = results;



        console.log(results);
      });
    }

    $scope.search_filter = null;
    $scope.filter_search_results = function(result) {
      if (!$scope.search_filter) { return true; }
      var regex = new RegExp(".*?"+$scope.search_filter+".*?", "i");

      if (result.title) {
        // it is an issue
        return regex.test(result.title);
      } else if (result.name) {
        // it is a project
        return regex.test(result.name);
      }

      // if it is neither an issue nor a project, just show it
      // (though that won't happen with the current API response)
      return true;
    }
  });
