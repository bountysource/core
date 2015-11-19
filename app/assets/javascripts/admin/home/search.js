angular.module('app')
.config(function ($routeProvider) {
  $routeProvider
    .when('/admin/search', {
      templateUrl: 'admin/home/search_results.html',
      controller: 'SearchResultsController',
      title: 'Search'
    });
})
.controller('NavbarSearchController', function ($api, $routeParams, $scope, $location) {
  $scope.search_query = null;
  $scope.submit_search = function() {
    if ($scope.search_query && $scope.search_query.length > 0) {
      $location.path("/admin/search").search({ query: $scope.search_query });
    }
  };
})
.controller("SearchResultsController", function ($api, $routeParams, $scope, $location) {
  $api.search($location.search()).then(function (response) {
    var data = response.data;
    if (response.meta.success) {
      $scope.results_found = true;
      $scope.people = data.people;
      $scope.bounties = data.bounties;
      $scope.fundraisers = data.fundraisers;
      $scope.trackers = data.trackers;
    } else {
      $scope.error = data.error;
    }
  });
});

