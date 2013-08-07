'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/search', {
        templateUrl: 'pages/home/search.html',
        controller: 'SearchController',
        title: 'Search'
      });
  })

  .controller('NavbarSearchController', function ($scope, $location) {
    $scope.search_query = null;
    $scope.submit_search = function() {
      if ($scope.search_query && $scope.search_query.length > 0) {
        $location.path("/search").search({ query: $scope.search_query });
      }
    };
  })

  .controller('SearchController', function ($scope, $location, $routeParams, $api) {
    $scope.search_query = $routeParams.query;
    $scope.search_query_submitted = (angular.isDefined($scope.search_query) && $scope.search_query.length > 0);
    $scope.search_pending = $scope.search_query_submitted;

    $scope.submit_search = function() {
      if ($scope.search_query.length > 0) {
        $scope.search_query_submitted = true;
        $scope.search_pending = true;

        $api.search($scope.search_query).then(function(response) {
          $scope.search_pending = false;

          // did we recognize this as a URL? Redirect to the appropriate issue or project page.
          if (response.redirect_to) {
            // LEGACY replace the '#' with '/'
            var url = response.redirect_to;
            if (url[0] === '#') {
              url = '/' + url.slice(1);
            }
            $location.path(url).replace();
          } else if (response.create_issue) {
            // oh no, nothing was found! redirect to page to create issue for arbitrary URL
            $location.path("/issues/new").search({ url: $scope.search_query }).replace();
          } else {
            // just render normal search results, returned by the API as
            // response.trackers and response.issues
            $scope.results = response;
          }
        });
      }
    };

    if ($routeParams.query) { $scope.submit_search(); }

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
    };
  });
